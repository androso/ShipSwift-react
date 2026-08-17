import { useEffect, useRef, type ReactNode } from "react";
import { parseCssColor, type SWColor } from "./SWColor";
import type { SWUniformValue } from "./SWShaderView";

const VERT = `#version 300 es
in vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export interface SWLayerEffectViewProps {
  source: string;
  uniforms?: Record<string, SWUniformValue>;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  snapshotIntervalMs?: number;
  /** Multiplier applied to `uTime` (Swift `elapsed * speed` for shaders without a speed uniform). */
  timeScale?: number;
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) throw new Error("Unable to create shader");
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh) ?? "compile error";
    gl.deleteShader(sh);
    throw new Error(log);
  }
  return sh;
}

function setUniform(
  gl: WebGL2RenderingContext,
  loc: WebGLUniformLocation,
  value: SWUniformValue,
) {
  if (typeof value === "boolean") {
    gl.uniform1f(loc, value ? 1 : 0);
    return;
  }
  if (typeof value === "number") {
    gl.uniform1f(loc, value);
    return;
  }
  if (typeof value === "string") {
    const c = parseCssColor(value);
    gl.uniform4f(loc, c[0], c[1], c[2], c[3]);
    return;
  }
  if (value.length === 2) gl.uniform2f(loc, value[0], value[1]);
  else if (value.length === 3) gl.uniform3f(loc, value[0], value[1], value[2]);
  else gl.uniform4f(loc, value[0], value[1], value[2], value[3] ?? 1);
}

async function snapshotNode(node: HTMLElement): Promise<HTMLCanvasElement | null> {
  const rect = node.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  const img = node.querySelector("img");
  const video = node.querySelector("video");
  const sourceCanvas = node.querySelector("canvas");
  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  const ctx = out.getContext("2d");
  if (!ctx) return null;

  const fillFallback = () => {
    const bg = getComputedStyle(node).backgroundColor;
    ctx.fillStyle = bg && bg !== "rgba(0, 0, 0, 0)" ? bg : "#222";
    ctx.fillRect(0, 0, width, height);
    return out;
  };

  if (img) {
    try {
      if (!img.complete) await img.decode();
    } catch {
      /* keep going */
    }
    if (img.naturalWidth) {
      try {
        ctx.drawImage(img, 0, 0, width, height);
        ctx.getImageData(0, 0, 1, 1);
        return out;
      } catch {
        /* tainted image; fall through */
      }
    }
  }
  if (video && video.readyState >= 2) {
    ctx.drawImage(video, 0, 0, width, height);
    return out;
  }
  if (sourceCanvas && sourceCanvas.width) {
    try {
      ctx.drawImage(sourceCanvas, 0, 0, width, height);
      ctx.getImageData(0, 0, 1, 1);
      return out;
    } catch {
      return fillFallback();
    }
  }
  try {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">${new XMLSerializer().serializeToString(node)}</foreignObject>
    </svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("snapshot"));
      image.src = url;
    });
    ctx.drawImage(image, 0, 0, width, height);
    URL.revokeObjectURL(url);
    ctx.getImageData(0, 0, 1, 1);
    return out;
  } catch {
    const fresh = document.createElement("canvas");
    fresh.width = width;
    fresh.height = height;
    const freshCtx = fresh.getContext("2d");
    if (!freshCtx) return null;
    const bg = getComputedStyle(node).backgroundColor;
    freshCtx.fillStyle = bg && bg !== "rgba(0, 0, 0, 0)" ? bg : "#222";
    freshCtx.fillRect(0, 0, width, height);
    return fresh;
  }
}

function applyUserUniforms(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  u: Record<string, SWUniformValue> | undefined,
) {
  if (!u) return;
  for (const [name, value] of Object.entries(u)) {
    if (name === "uSize" && typeof value === "number") {
      const locF = gl.getUniformLocation(program, "uSizeF");
      if (locF) {
        gl.uniform1f(locF, value);
        continue;
      }
    }
    const loc = gl.getUniformLocation(program, name);
    if (loc) setUniform(gl, loc, value);
  }
}

export function SWLayerEffectView({
  source,
  uniforms,
  children,
  className,
  style,
  snapshotIntervalMs = 80,
  timeScale = 1,
}: SWLayerEffectViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const uniformsRef = useRef(uniforms);
  uniformsRef.current = uniforms;
  const timeScaleRef = useRef(timeScale);
  timeScaleRef.current = timeScale;

  useEffect(() => {
    const canvas = canvasRef.current;
    const content = contentRef.current;
    if (!canvas || !content) return;
    const gl = canvas.getContext("webgl2", {
      premultipliedAlpha: false,
      alpha: true,
    });
    if (!gl) return;

    let program: WebGLProgram | null = null;
    try {
      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, source);
      program = gl.createProgram()!;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.bindAttribLocation(program, 0, "aPos");
      gl.linkProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    } catch (err) {
      console.error("SWLayerEffectView:", err);
      return;
    }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const start = performance.now();
    let raf = 0;
    let lastSnap = 0;
    let running = true;

    const draw = async (t: number) => {
      if (!program || !running) return;
      const rect = canvas.parentElement?.getBoundingClientRect() ?? canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      if (t - lastSnap > snapshotIntervalMs) {
        lastSnap = t;
        const snap = await snapshotNode(content);
        if (snap) {
          try {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, snap);
          } catch {
            // Cross-origin snapshots taint the canvas; keep the previous texture.
          }
        }
      }
      gl.viewport(0, 0, w, h);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      const time = ((t - start) / 1000) * timeScaleRef.current;
      applyUserUniforms(gl, program, uniformsRef.current);
      const sizeLoc = gl.getUniformLocation(program, "uSize");
      const timeLoc = gl.getUniformLocation(program, "uTime");
      const layerLoc = gl.getUniformLocation(program, "uLayer");
      if (sizeLoc) gl.uniform2f(sizeLoc, w, h);
      if (timeLoc) gl.uniform1f(timeLoc, time);
      if (layerLoc) gl.uniform1i(layerLoc, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      gl.deleteProgram(program);
      gl.deleteBuffer(buf);
      gl.deleteTexture(texture);
    };
  }, [source, snapshotIntervalMs]);

  return (
    <div className={className} style={{ position: "relative", ...style }}>
      <div
        ref={contentRef}
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
      <canvas
        ref={canvasRef}
        className="sw-shader-canvas"
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}

export type { SWColor };
