import { Link, useNavigate } from "react-router";
import type { ReactNode } from "react";
import { ListItem } from "@/components/ListItem";

export function DemoPage({
  title,
  children,
  pad = true,
}: {
  title: string;
  children: ReactNode;
  pad?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <div className="sw-page">
      <header className="sw-nav-header">
        <button type="button" className="sw-nav-back" onClick={() => navigate(-1)}>
          ‹ Back
        </button>
        <h1 className="sw-nav-title" style={{ fontSize: 20 }}>
          {title}
        </h1>
      </header>
      <div style={{ padding: pad ? 16 : 0, minHeight: "70vh" }}>{children}</div>
    </div>
  );
}

export function CatalogList({
  title,
  items,
  base,
}: {
  title: string;
  base: string;
  items: { id: string; title: string; icon: string; description: string }[];
}) {
  return (
    <div className="sw-page">
      <header className="sw-nav-header">
        <h1 className="sw-nav-title">{title}</h1>
      </header>
      <div className="sw-list-section">
        <div style={{ borderRadius: 12, overflow: "hidden" }}>
          {items.map((item) => (
            <Link key={item.id} to={`${base}/${item.id}`} className="sw-list-row">
              <ListItem title={item.title} icon={item.icon} description={item.description} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
