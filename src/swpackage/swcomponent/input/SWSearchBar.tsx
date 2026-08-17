/**
 * Capsule-shaped search bar with a magnifying-glass icon, an inline text
 * field, and an auto-appearing clear button. Uses an ultra-thin material
 * background for a frosted look.
 *
 * The component does NOT apply any outer horizontal padding — the caller
 * is expected to wrap it so the bar can be reused in different layouts.
 *
 * Usage:
 *   <SWSearchBar text={query} onTextChange={setQuery} />
 *   <SWSearchBar text={query} onTextChange={setQuery} placeholder="Search contacts" />
 */
import { SWSymbol } from "@/swpackage/swutil";

export function SWSearchBar({
  text,
  onTextChange,
  placeholder = "Search",
}: {
  /** Two-way binding to the current search text. */
  text: string;
  onTextChange: (text: string) => void;
  /** Placeholder shown when the field is empty. */
  placeholder?: string;
}) {
  return (
    <div
      className="sw-ultra-thin"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 999,
        fontSize: 14,
      }}
    >
      <SWSymbol name="magnifyingglass" size={16} color="var(--sw-secondary-label)" />
      <input
        type="search"
        value={text}
        placeholder={placeholder}
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        onChange={(event) => onTextChange(event.target.value)}
        style={{
          flex: 1,
          border: "none",
          background: "transparent",
          outline: "none",
          minWidth: 0,
        }}
      />
      {text.length > 0 && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onTextChange("")}
          style={{
            border: "none",
            background: "none",
            padding: 0,
            display: "flex",
          }}
        >
          <SWSymbol name="xmark.circle.fill" size={16} color="var(--sw-secondary-label)" />
        </button>
      )}
    </div>
  );
}
