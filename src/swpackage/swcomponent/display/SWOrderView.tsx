/**
 * Animated drink customization demo page showcasing flavor selection, cup
 * size switching, gradient background animation, matched-geometry selector,
 * and cup scale/offset animation.
 *
 * Usage:
 *   <SWOrderView />
 */
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { haptic, SWSymbol } from "@/swpackage/swutil";

const FLAVORS = ["Matcha", "Chocolate", "Latte"] as const;
const SIZES = ["Medium", "Large", "XL"] as const;

type SWFlavor = (typeof FLAVORS)[number];
type SWSize = (typeof SIZES)[number];

function flavorColor(flavor: string): string {
  if (flavor === "Latte") return "rgb(194, 153, 107)";
  if (flavor === "Chocolate") return "var(--sw-brown)";
  return "rgb(51, 128, 77)";
}

function flavorImage(flavor: string): string {
  if (flavor === "Matcha") return "/demo/matcha.png";
  if (flavor === "Chocolate") return "/demo/chocolate.png";
  return "/demo/latte.png";
}

function cupHeight(size: string): number {
  if (size === "Large") return 320;
  if (size === "XL") return 380;
  return 260;
}

export function SWOrderView() {
  const [qty, setQty] = useState(1);
  const [flavor, setFlavor] = useState<SWFlavor>("Matcha");
  const [size, setSize] = useState<SWSize>("Medium");
  const bg = flavorColor(flavor);

  return (
    <div
      style={{
        position: "relative",
        minHeight: 640,
        overflow: "hidden",
        color: "#fff",
      }}
    >
      <motion.div
        aria-hidden
        animate={{
          background: `linear-gradient(180deg, #000 0%, ${bg} 100%)`,
        }}
        transition={{ duration: 0.45 }}
        style={{ position: "absolute", inset: 0 }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 30,
          minHeight: 640,
        }}
      >
        <div
          style={{
            height: 420,
            position: "relative",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <AnimatePresence>
            {Array.from({ length: qty }, (_, i) => (
              <SWCupView key={i} idx={i} count={qty} img={flavor} size={size} />
            ))}
          </AnimatePresence>
        </div>
        <SWQuantityControl qty={qty} onQtyChange={setQty} />
        <div style={{ display: "grid", gap: 20 }}>
          <SWOrderSelector
            items={[...SIZES]}
            sel={size}
            onSelChange={(value) => setSize(value as SWSize)}
            ns="size"
            label="Size"
          />
          <SWOrderSelector
            items={[...FLAVORS]}
            sel={flavor}
            onSelChange={(value) => setFlavor(value as SWFlavor)}
            ns="flavor"
            label="Flavor"
          />
        </div>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          style={{
            margin: 16,
            fontSize: 20,
            fontWeight: 700,
            minHeight: 56,
            width: "calc(100% - 32px)",
            border: "none",
            borderRadius: 999,
            background: "#fff",
            color: bg,
          }}
        >
          {`Add to Cart   ¥${33 * qty}`}
        </button>
      </div>
    </div>
  );
}

export function SWCupView({
  idx,
  count,
  img,
  size,
}: {
  idx: number;
  count: number;
  img: string;
  size: string;
}) {
  const isSide = count === 2 || (count >= 3 && idx !== 1);
  let xOffset = 0;
  if (count === 2) xOffset = idx === 0 ? -60 : 60;
  else if (count === 3) xOffset = idx === 0 ? -80 : idx === 2 ? 80 : 0;

  return (
    <motion.img
      src={flavorImage(img)}
      alt={img}
      initial={{ scale: 0.1, opacity: 0 }}
      animate={{
        scale: isSide ? 0.75 : 1,
        x: xOffset,
        opacity: 1,
        height: cupHeight(size),
      }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      style={{
        position: "absolute",
        bottom: 0,
        height: cupHeight(size),
        width: "auto",
        objectFit: "contain",
        filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.3))",
        zIndex: count === 3 && idx === 1 ? 10 : idx,
        pointerEvents: "none",
      }}
    />
  );
}

export function SWOrderSelector({
  items,
  sel,
  onSelChange,
  ns,
  label,
}: {
  items: string[];
  sel: string;
  onSelChange: (sel: string) => void;
  ns: string;
  label: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 8,
      }}
    >
      <strong style={{ width: 60, color: "#fff" }}>{label}</strong>
      <div
        style={{
          display: "flex",
          flex: 1,
          padding: 4,
          borderRadius: 999,
          background: "rgba(255,255,255,0.1)",
        }}
      >
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              haptic();
              onSelChange(item);
            }}
            style={{
              position: "relative",
              flex: 1,
              border: "none",
              background: "none",
              color: sel === item ? "#fff" : "rgba(255,255,255,0.6)",
              padding: "8px 0",
              zIndex: 1,
            }}
          >
            {sel === item && (
              <motion.span
                layoutId={`${ns}-selector`}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.2)",
                  zIndex: -1,
                }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SWQuantityControl({
  qty,
  onQtyChange,
}: {
  qty: number;
  onQtyChange: (qty: number) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        color: "#fff",
      }}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => {
          if (qty > 1) {
            haptic();
            onQtyChange(qty - 1);
          }
        }}
        style={{ border: "none", background: "none", padding: 0 }}
      >
        <SWSymbol name="minus.circle.fill" size={36} color="#fff" />
      </button>
      <motion.span
        key={qty}
        initial={{ y: 8, opacity: 0.4 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          width: 60,
          textAlign: "center",
          fontSize: 40,
          fontWeight: 900,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {qty}
      </motion.span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => {
          if (qty < 3) {
            haptic();
            onQtyChange(qty + 1);
          }
        }}
        style={{ border: "none", background: "none", padding: 0 }}
      >
        <SWSymbol name="plus.circle.fill" size={36} color="#fff" />
      </button>
    </div>
  );
}

export function SWOrderButton({
  icon,
  action,
}: {
  icon: string;
  action: () => void;
}) {
  return (
    <button
      type="button"
      onClick={action}
      style={{
        width: 44,
        height: 44,
        border: "none",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.2)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SWSymbol name={icon} size={18} color="#fff" />
    </button>
  );
}
