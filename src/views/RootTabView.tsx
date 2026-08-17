import { NavLink, Navigate, Route, Routes, useLocation } from "react-router";
import { SWSymbol } from "@/swpackage/swutil";
import { HomeView } from "./HomeView";
import { AnimationListView, AnimationDemo } from "./AnimationListView";
import { ChartListView, ChartDemo } from "./ChartListView";
import { UIListView, UIDemo } from "./UIListView";

const TABS = [
  { to: "/", id: "home", label: "Home", icon: "house", activeIcon: "house.fill" },
  { to: "/animation", id: "animation", label: "Animation", icon: "sparkles", activeIcon: "sparkles" },
  { to: "/charts", id: "charts", label: "Charts", icon: "chart.bar", activeIcon: "chart.bar.fill" },
  { to: "/ui", id: "ui", label: "UI", icon: "square.grid.2x2", activeIcon: "square.grid.2x2.fill" },
] as const;

export function RootTabView() {
  const location = useLocation();
  const depth = location.pathname.split("/").filter(Boolean).length;
  const showTabBar = depth < 2;

  return (
    <>
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/animation" element={<AnimationListView />} />
        <Route path="/animation/:id" element={<AnimationDemo />} />
        <Route path="/charts" element={<ChartListView />} />
        <Route path="/charts/:id" element={<ChartDemo />} />
        <Route path="/ui" element={<UIListView />} />
        <Route path="/ui/:id" element={<UIDemo />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showTabBar && (
        <nav className="sw-tab-bar">
          {TABS.map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.to}
              end={tab.to === "/"}
              className={({ isActive }) => `sw-tab-item${isActive ? " active" : ""}`}
            >
              {({ isActive }) => (
                <>
                  <SWSymbol name={isActive ? tab.activeIcon : tab.icon} size={22} />
                  {tab.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}
    </>
  );
}
