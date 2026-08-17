import { useEffect, useRef } from "react";
import { parseCssColor, type SWColor } from "./SWColor";

const VERT = `#version 300 es
in vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export type SWUniformValue = number | number[] | string | SWColor | boolean;

export interface SWShaderViewProps {
  source: string;
  uniforms?: Record<string, SWUniformValue>;
  className?: string;
  style?: React.CSSProperties;
  paused?: boolean;
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

function applyUserUniforms(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  u: Record<string, SWUniformValue> | undefined,
) {
  if (!u) return;
  for (const [name, value] of Object.entries(u)) {
    // Metal `size` becomes `uSize`, which collides with the canvas vec2 `uSize`.
    // Conflicting .frag files declare the float as `uSizeF`.
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

export function SWShaderView({
  source,
  uniforms,
  className,
  style,
  paused = false,
  timeScale = 1,
}: SWShaderViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uniformsRef = useRef(uniforms);
  uniformsRef.current = uniforms;
  const timeScaleRef = useRef(timeScale);
  timeScaleRef.current = timeScale;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", {
      premultipliedAlpha: false,
      alpha: true,
    });
    if (!gl) return;

    let program: WebGLProgram | null = null;
    try {
      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, source);
      program = gl.createProgram();
      if (!program) return;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.bindAttribLocation(program, 0, "aPos");
      gl.linkProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) ?? "link error");
      }
    } catch (err) {
      console.error("SWShaderView:", err);
      return;
    }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const start = performance.now();
    let raf = 0;
    let running = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting && !paused;
      },
      { threshold: 0.01 },
    );
    observer.observe(canvas);

    const draw = () => {
      if (!program) return;
      const parent = canvas.parentElement;
      const rect = (parent ?? canvas).getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

      const time = ((performance.now() - start) / 1000) * timeScaleRef.current;
      applyUserUniforms(gl, program, uniformsRef.current);
      const sizeLoc = gl.getUniformLocation(program, "uSize");
      const timeLoc = gl.getUniformLocation(program, "uTime");
      if (sizeLoc) gl.uniform2f(sizeLoc, w, h);
      if (timeLoc) gl.uniform1f(timeLoc, time);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (running) raf = requestAnimationFrame(draw);
    };

    draw();
    const resume = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const vis = () => {
      running = document.visibilityState === "visible" && !paused;
      if (running) resume();
    };
    document.addEventListener("visibilitychange", vis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("visibilitychange", vis);
      gl.deleteProgram(program);
      gl.deleteBuffer(buf);
    };
  }, [source, paused]);

  return (
    <canvas
      ref={canvasRef}
      className={["sw-shader-canvas", className].filter(Boolean).join(" ")}
      style={{ width: "100%", height: "100%", display: "block", ...style }}
    />
  );
}
