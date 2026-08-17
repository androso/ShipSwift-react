import { useState, type ReactNode } from "react";
import { SWSymbol } from "./SWSymbol";

export type SWControlField =
  | { kind: "slider"; key: string; label: string; min: number; max: number; step?: number }
  | { kind: "color"; key: string; label: string }
  | { kind: "select"; key: string; label: string; options: { value: string; label: string }[] }
  | { kind: "toggle"; key: string; label: string };

export function SWShaderControlsSheet({
  title,
  values,
  fields,
  onChange,
  children,
}: {
  title: string;
  values: Record<string, string | number | boolean>;
  fields: SWControlField[];
  onChange: (key: string, value: string | number | boolean) => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 280 }}>
      <div style={{ position: "absolute", inset: 0 }}>{children}</div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${title} Controls`}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 2,
          width: 36,
          height: 36,
          borderRadius: 18,
          border: "none",
          background: "color-mix(in srgb, var(--sw-surface) 80%, transparent)",
        }}
      >
        <SWSymbol name="slider.horizontal.3" />
      </button>
      {open && (
        <div className="sw-sheet-backdrop" onClick={() => setOpen(false)}>
          <div className="sw-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>{title}</strong>
              <button type="button" className="sw-nav-back" onClick={() => setOpen(false)}>
                Done
              </button>
            </div>
            {fields.map((field) => {
              const value = values[field.key];
              if (field.kind === "slider") {
                return (
                  <div className="sw-form-row" key={field.key}>
                    <label>
                      {field.label}
                      <span>{typeof value === "number" ? value.toFixed(2) : String(value)}</span>
                    </label>
                    <input
                      type="range"
                      min={field.min}
                      max={field.max}
                      step={field.step ?? 0.05}
                      value={Number(value)}
                      onChange={(e) => onChange(field.key, Number(e.target.value))}
                    />
                  </div>
                );
              }
              if (field.kind === "color") {
                return (
                  <div className="sw-form-row" key={field.key}>
                    <label>{field.label}</label>
                    <input
                      type="color"
                      value={String(value)}
                      onChange={(e) => onChange(field.key, e.target.value)}
                    />
                  </div>
                );
              }
              if (field.kind === "toggle") {
                return (
                  <div className="sw-form-row" key={field.key}>
                    <label>
                      {field.label}
                      <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(e) => onChange(field.key, e.target.checked)}
                      />
                    </label>
                  </div>
                );
              }
              return (
                <div className="sw-form-row" key={field.key}>
                  <label>{field.label}</label>
                  <select
                    value={String(value)}
                    onChange={(e) => onChange(field.key, e.target.value)}
                  >
                    {field.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
