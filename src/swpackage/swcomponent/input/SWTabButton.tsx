/**
 * Capsule-shaped tab button that toggles between selected (accent color)
 * and unselected (gray) states. Suitable for building custom segmented
 * controls or horizontal filter bars.
 *
 * Usage:
 *   <SWTabButton title="All" isSelected={selectedTab === 0} action={() => setSelectedTab(0)} />
 */
export function SWTabButton({
  title,
  isSelected,
  action,
}: {
  title: string;
  isSelected: boolean;
  action: () => void;
}) {
  return (
    <button
      type="button"
      onClick={action}
      style={{
        border: "none",
        fontSize: 15,
        fontWeight: 500,
        padding: "8px 16px",
        borderRadius: 999,
        background: isSelected
          ? "var(--sw-accent)"
          : "color-mix(in srgb, var(--sw-secondary-label) 20%, transparent)",
        color: isSelected ? "#fff" : "var(--sw-label)",
      }}
    >
      {title}
    </button>
  );
}
