import { Link } from "react-router";
import { SWAlertManager } from "@/swpackage/swcomponent";
import { SWBulletPointText } from "@/swpackage/swcomponent";
import { SWGradientDivider } from "@/swpackage/swcomponent";
import { SWStatusBadge } from "@/swpackage/swcomponent";
import { SWShakingIcon } from "@/swpackage/swanimation";
import { SWSymbol } from "@/swpackage/swutil";
import { useState } from "react";

const SKILLS = "npx skills add signerlabs/shipswift-skills";

export function HomeView() {
  const [copied, setCopied] = useState(false);

  return (
    <div className="sw-page">
      <header className="sw-nav-header">
        <h1 className="sw-nav-title">ShipSwift</h1>
      </header>
      <div className="sw-home">
        <section className="sw-home-hero">
          <SWShakingIcon image="/demo/shipswift-logo.png" height={120} cornerRadius={16} idleDelay={6} />
          <p style={{ fontSize: 20, color: "var(--sw-secondary-label)", margin: "12px 0 0" }}>
            Production-ready React components for Vite.
          </p>
          <p style={{ color: "var(--sw-secondary-label)", fontSize: 15 }}>
            Copy a recipe, drop it into your app, and ship.
          </p>
        </section>

        <section style={{ marginTop: 24 }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 17 }}>
            <SWSymbol name="terminal.fill" color="var(--sw-accent)" />
            Install Skills
          </h2>
          <button
            type="button"
            className="sw-terminal"
            onClick={async () => {
              await navigator.clipboard.writeText(SKILLS);
              SWAlertManager.shared.show("success", "Copied!");
              setCopied(true);
              setTimeout(() => setCopied(false), 800);
            }}
          >
            <span style={{ color: "#3cb371" }}>$ </span>
            {SKILLS}
            <span style={{ position: "absolute", top: 8, right: 8 }}>
              <SWSymbol name={copied ? "checkmark" : "doc.on.doc"} size={14} />
            </span>
          </button>
          <p style={{ fontSize: 12, color: "var(--sw-secondary-label)" }}>
            Gives your AI assistant the ShipSwift recipe catalog.
          </p>
        </section>

        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <a className="sw-btn sw-btn-secondary" href="https://shipswift.app" style={{ textDecoration: "none" }}>
            <SWSymbol name="globe" size={16} /> Website
          </a>
          <a
            className="sw-btn sw-btn-secondary"
            href="https://github.com/signerlabs/ShipSwift"
            style={{ textDecoration: "none" }}
          >
            GitHub
          </a>
        </div>

        <div className="sw-home-grid" style={{ marginTop: 24 }}>
          <ModuleCard to="/animation" icon="sparkles" color="var(--sw-orange)" title="Animation" subtitle="Components" description="Transitions, shaders, shimmer, and more" />
          <ModuleCard to="/charts" icon="chart.bar.fill" color="var(--sw-green)" title="Charts" subtitle="Components" description="Line, Bar, Area, Donut, Radar, Scatter, and more" />
          <ModuleCard to="/ui" icon="square.grid.2x2.fill" color="var(--sw-purple)" title="UI" subtitle="Components" description="Display, Feedback, Input — ready to use" />
          <ModuleCard to="/animation/plasma" icon="flame.fill" color="var(--sw-red)" title="Shaders" subtitle="WebGL" description="28 Metal recipes ported to GLSL" />
        </div>

        <section
          style={{
            marginTop: 24,
            padding: 18,
            borderRadius: 14,
            background: "var(--sw-surface)",
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <SWSymbol name="hammer.fill" size={22} color="var(--sw-accent)" />
            <div>
              <strong>Need a custom app?</strong>
              <div style={{ color: "var(--sw-secondary-label)", fontSize: 14 }}>We ship production apps on this library.</div>
            </div>
          </div>
          <div style={{ margin: "12px 0" }}>
            <SWStatusBadge text="From $5,000 · 4 weeks" style="info" />
          </div>
          <SWBulletPointText bulletColor="var(--sw-blue)">Web + iOS from one design system</SWBulletPointText>
          <SWBulletPointText bulletColor="var(--sw-green)">Backend, auth, and payments</SWBulletPointText>
          <SWBulletPointText bulletColor="var(--sw-orange)">Integrations and analytics</SWBulletPointText>
          <SWGradientDivider color="var(--sw-accent)" opacity={0.3} height={1} />
          <a href="mailto:wei@signerlabs.com" style={{ display: "flex", justifyContent: "space-between", textDecoration: "none", marginTop: 12 }}>
            <span style={{ color: "var(--sw-accent)", fontWeight: 600 }}>
              <SWSymbol name="envelope.fill" size={16} /> Contact founder services
            </span>
            <SWSymbol name="chevron.right" size={14} color="var(--sw-accent)" />
          </a>
        </section>

        <p style={{ textAlign: "center", marginTop: 24 }}>
          <a href="https://shipswift.app" style={{ color: "var(--sw-secondary-label)", fontSize: 12 }}>
            shipswift.app
          </a>
        </p>
      </div>
    </div>
  );
}

function ModuleCard({
  to,
  icon,
  color,
  title,
  subtitle,
  description,
}: {
  to: string;
  icon: string;
  color: string;
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <Link to={to} className="sw-module-card">
      <SWSymbol name={icon} size={22} color={color} />
      <strong>{title}</strong>
      <span style={{ color, fontSize: 12 }}>{subtitle}</span>
      <span style={{ color: "var(--sw-secondary-label)", fontSize: 12 }}>{description}</span>
    </Link>
  );
}
