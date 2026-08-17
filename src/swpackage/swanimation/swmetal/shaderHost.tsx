import { useState, type CSSProperties, type ReactNode } from "react";
import {
  parseCssColor,
  SWLayerEffectView,
  SWShaderControlsSheet,
  SWShaderView,
  type SWControlField,
  type SWUniformValue,
} from "@/swpackage/swutil";

export const shaderFillStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  minHeight: 0,
};

export type SWTilt = { width: number; height: number };

export function demoSrc(name: string): string {
  if (/^(https?:|data:|blob:|\/)/i.test(name)) return name;
  return name.includes(".") ? `/demo/${name}` : `/demo/${name}.png`;
}

export function rgb3(color: string): [number, number, number] {
  const c = parseCssColor(color);
  return [c[0], c[1], c[2]];
}

export function padColors(colors: string[], count: number, fallback = "#000000"): string[] {
  const out = colors.slice(0, count);
  const tail = out[out.length - 1] ?? fallback;
  while (out.length < count) out.push(tail);
  return out;
}

export function defaultLayerDemo(): ReactNode {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 320,
        background: "linear-gradient(160deg, #1e3a5f 0%, #c45c26 52%, #1a2659 100%)",
      }}
    >
      <img
        src={demoSrc("face-picture")}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}

export function ColorShader({
  source,
  uniforms,
  timeScale,
  showsControls,
  title,
  values,
  fields,
  onChange,
}: {
  source: string;
  uniforms: Record<string, SWUniformValue>;
  timeScale?: number;
  showsControls?: boolean;
  title: string;
  values: Record<string, string | number | boolean>;
  fields: SWControlField[];
  onChange: (key: string, value: string | number | boolean) => void;
}) {
  const view = (
    <div style={shaderFillStyle}>
      <SWShaderView source={source} uniforms={uniforms} timeScale={timeScale} />
    </div>
  );
  if (!showsControls) return view;
  return (
    <SWShaderControlsSheet title={title} values={values} fields={fields} onChange={onChange}>
      {view}
    </SWShaderControlsSheet>
  );
}

export function LayerShader({
  source,
  uniforms,
  timeScale,
  showsControls,
  title,
  values,
  fields,
  onChange,
  children,
}: {
  source: string;
  uniforms: Record<string, SWUniformValue>;
  timeScale?: number;
  showsControls?: boolean;
  title: string;
  values: Record<string, string | number | boolean>;
  fields: SWControlField[];
  onChange: (key: string, value: string | number | boolean) => void;
  children?: ReactNode;
}) {
  const content = children ?? defaultLayerDemo();
  const view = (
    <SWLayerEffectView
      source={source}
      uniforms={uniforms}
      timeScale={timeScale}
      style={shaderFillStyle}
    >
      {content}
    </SWLayerEffectView>
  );
  if (!showsControls) return view;
  return (
    <SWShaderControlsSheet title={title} values={values} fields={fields} onChange={onChange}>
      {view}
    </SWShaderControlsSheet>
  );
}

export function useControlState<T extends Record<string, string | number | boolean>>(
  props: T,
  showsControls: boolean,
): [T, (key: string, value: string | number | boolean) => void] {
  const [state, setState] = useState(props);
  const values = (showsControls ? state : props) as T;
  const onChange = (key: string, value: string | number | boolean) => {
    setState((s) => ({ ...s, [key]: value }) as T);
  };
  return [values, onChange];
}
