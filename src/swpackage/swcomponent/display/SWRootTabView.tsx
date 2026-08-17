/**
 * Root TabView template with selected/unselected icon switching, a search
 * tab, and haptic feedback. This is the COMPONENT recipe, not the app shell —
 * tab selection is local state.
 *
 * Usage:
 *   <SWRootTabView />
 */
import { useState } from "react";
import { haptic, SWSymbol } from "@/swpackage/swutil";

type SWRootTabId = "home" | "outfit" | "setting" | "search";

type SWRootTab = {
  id: SWRootTabId;
  title: string;
  icon: string;
  iconSelected: string;
  heading: string;
  description: string;
};

const TABS: SWRootTab[] = [
  {
    id: "home",
    title: "Home",
    icon: "house",
    iconSelected: "house.fill",
    heading: "Home",
    description: "Your main feed and dashboard content goes here.",
  },
  {
    id: "outfit",
    title: "Outfit",
    icon: "tshirt",
    iconSelected: "tshirt.fill",
    heading: "Outfit",
    description: "Browse and manage your outfit collections here.",
  },
  {
    id: "setting",
    title: "Setting",
    icon: "gearshape",
    iconSelected: "gearshape.fill",
    heading: "Settings",
    description: "Adjust preferences, account, and app configuration.",
  },
  {
    id: "search",
    title: "Search",
    icon: "magnifyingglass",
    iconSelected: "magnifyingglass",
    heading: "Search",
    description: "Search results appear here.",
  },
];

export function SWRootTabView() {
  const [selectedTab, setSelectedTab] = useState<SWRootTabId>("home");
  const [searchText, setSearchText] = useState("");
  const active = TABS.find((tab) => tab.id === selectedTab) ?? TABS[0];

  return (
    <div
      style={{
        position: "relative",
        minHeight: 480,
        height: "100%",
        background: "var(--sw-bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header className="sw-nav-header">
        <h1 className="sw-nav-title">{active.title}</h1>
      </header>

      {selectedTab === "search" && (
        <div style={{ padding: "8px 16px 0" }}>
          <input
            type="search"
            value={searchText}
            placeholder="Search..."
            onChange={(event) => setSearchText(event.target.value)}
            style={{
              width: "100%",
              border: "none",
              borderRadius: 12,
              padding: "10px 12px",
              background: "var(--sw-fill)",
              outline: "none",
            }}
          />
        </div>
      )}

      <div style={{ flex: 1, overflow: "auto" }}>
        <Unavailable
          icon={active.iconSelected}
          title={
            selectedTab === "search" && searchText
              ? `No results for “${searchText}”`
              : active.heading
          }
          description={
            selectedTab === "search" && searchText
              ? "Try a different keyword."
              : active.description
          }
        />
      </div>

      <nav className="sw-tab-bar" style={{ position: "sticky" }}>
        {TABS.map((tab) => {
          const isActive = tab.id === selectedTab;
          return (
            <button
              key={tab.id}
              type="button"
              className={isActive ? "sw-tab-item active" : "sw-tab-item"}
              onClick={() => {
                if (tab.id !== selectedTab) haptic();
                setSelectedTab(tab.id);
              }}
            >
              <SWSymbol
                name={isActive ? tab.iconSelected : tab.icon}
                size={20}
                color={isActive ? "var(--sw-accent)" : "var(--sw-secondary-label)"}
              />
              {tab.title}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function Unavailable({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        minHeight: 280,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 24,
        textAlign: "center",
        color: "var(--sw-secondary-label)",
      }}
    >
      <SWSymbol name={icon} size={40} color="var(--sw-secondary-label)" />
      <h2 style={{ margin: 0, fontSize: 20, color: "var(--sw-label)" }}>{title}</h2>
      <p style={{ margin: 0, maxWidth: 280 }}>{description}</p>
    </div>
  );
}
