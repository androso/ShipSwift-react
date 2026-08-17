/**
 * Compact numeric stepper with chevron-style increment/decrement buttons,
 * animated numeric text transitions, and haptic feedback on value change.
 * The decrement button is disabled when the value reaches 0.
 *
 * Usage:
 *   <SWStepper quantity={quantity} onQuantityChange={setQuantity} />
 */
import { haptic, SWSymbol } from "@/swpackage/swutil";

export function SWStepper({
  quantity,
  onQuantityChange,
}: {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <button
        type="button"
        disabled={quantity <= 0}
        aria-label="Decrease"
        onClick={() => {
          if (quantity <= 0) return;
          haptic();
          onQuantityChange(quantity - 1);
        }}
        style={{
          border: "none",
          background: "none",
          padding: 4,
          opacity: quantity <= 0 ? 0.35 : 1,
        }}
      >
        <SWSymbol name="chevron.backward" size={18} />
      </button>
      <span
        style={{
          minWidth: 26,
          textAlign: "center",
          fontVariantNumeric: "tabular-nums",
          fontWeight: 600,
        }}
      >
        {quantity}
      </span>
      <button
        type="button"
        aria-label="Increase"
        onClick={() => {
          haptic();
          onQuantityChange(quantity + 1);
        }}
        style={{ border: "none", background: "none", padding: 4 }}
      >
        <SWSymbol name="chevron.forward" size={18} />
      </button>
    </div>
  );
}
