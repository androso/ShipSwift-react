import type { CSSProperties } from "react";

const ICONS: Record<string, string> = {
  house: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  "house.fill": "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z",
  sparkles:
    "M12 2l1.2 4.8L18 8l-4.8 1.2L12 14l-1.2-4.8L6 8l4.8-1.2zM18 14l.7 2.8L21.5 17.5 18.7 18.2 18 21l-.7-2.8L14.5 17.5l2.8-.7z",
  "chart.bar": "M4 19h16M7 16V9m5 7V5m5 11v-6",
  "chart.bar.fill": "M6 19V9h2v10H6zm5 0V5h2v14h-2zm5 0v-6h2v6h-2z",
  "square.grid.2x2":
    "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  "square.grid.2x2.fill":
    "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  gearshape:
    "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM4 12l2.1-1.2.4-2.3 2.3-.4L10.8 6h2.4l1 2.1 2.3.4.4 2.3L19 12l-2.1 1.2-.4 2.3-2.3.4-1 2.1h-2.4l-1-2.1-2.3-.4-.4-2.3z",
  "gearshape.fill":
    "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM4 12l2.1-1.2.4-2.3 2.3-.4L10.8 6h2.4l1 2.1 2.3.4.4 2.3L19 12l-2.1 1.2-.4 2.3-2.3.4-1 2.1h-2.4l-1-2.1-2.3-.4-.4-2.3z",
  "terminal.fill": "M4 5h16v14H4zM7 9l3 3-3 3m5 0h5",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm-9 9h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18",
  "chevron.left.forwardslash.chevron.right": "M8 6 3 12l5 6M16 6l5 6-5 6M14 5l-4 14",
  "checkmark.seal.fill":
    "M12 2 14.5 4.2 17.7 4l1.1 3.1L21.5 9 20.7 12l.8 3-2.7 1.9-1.1 3.1-3.2-.2L12 22l-2.5-2.2-3.2.2-1.1-3.1L2.5 15l.8-3-.8-3 2.7-1.9L6.3 4l3.2.2zM10 12.5l1.8 1.8 3.7-4",
  "lock.open.fill": "M7 11V8a5 5 0 0 1 9.5-2M6 11h12v10H6z",
  "puzzlepiece.extension.fill":
    "M6 8h4V6a2 2 0 1 1 4 0v2h4v4h2a2 2 0 1 1 0 4h-2v4H6v-4H4a2 2 0 1 1 0-4h2z",
  "sparkles.tv.fill": "M4 6h16v10H4zM8 20h8M12 16v4",
  hammer: "M14 4l6 6-3 1-8 8-4-4 8-8z",
  "hammer.fill": "M14 4l6 6-3 1-8 8-4-4 8-8z",
  envelope: "M3 6h18v12H3zM3 6l9 7 9-7",
  "envelope.fill": "M3 6h18v12H3zM3 6l9 7 9-7",
  "chevron.right": "M9 6l6 6-6 6",
  "chevron.left": "M15 6l-6 6 6 6",
  "chevron.forward": "M9 6l6 6-6 6",
  "chevron.backward": "M15 6l-6 6 6 6",
  pencil: "M4 20l4.5-1.2L19 8.3 15.7 5 5.2 15.5zM14.5 6.2l3.3 3.3",
  cpu: "M8 8h8v8H8zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 5l2 2M5 19l2-2M17 19l2-2",
  "cpu.fill": "M8 8h8v8H8zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 5l2 2M5 19l2-2M17 19l2-2",
  "doc.text": "M7 3h7l5 5v13H7zM14 3v5h5M9 12h8M9 16h6",
  "doc.text.fill": "M7 3h7l5 5v13H7zM14 3v5h5M9 12h8M9 16h6",
  paperplane: "M3 11l18-8-8 18-2-7z",
  "paperplane.fill": "M3 11l18-8-8 18-2-7z",
  "minus.circle.fill": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 12h8",
  "plus.circle.fill": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8v8M8 12h8",
  "arrow.up.right": "M7 17 17 7M9 7h8v8",
  "arrow.down.right": "M7 7l10 10M17 9v8H9",
  "bag.fill": "M6 8h12l-1 12H7zM9 8V6a3 3 0 0 1 6 0v2",
  "info.circle.fill": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 8v5m0-8h.01",
  "checkmark.circle.fill": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm-1.2 9.8 1.8 1.8 4-4",
  "exclamationmark.triangle.fill": "M12 3 22 20H2zM12 9v5m0 3h.01",
  "xmark.circle.fill": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm-3 6 6 6m0-6-6 6",
  "star.fill": "M12 3l2.6 5.4 6 .9-4.3 4.2 1 5.9L12 16.8 6.7 19.4l1-5.9L3.4 9.3l6-.9z",
  "arrow.triangle.2.circlepath": "M4 12a8 8 0 0 1 13-5M20 12a8 8 0 0 1-13 5M17 4v4h-4M7 20v-4h4",
  "square.stack.3d.forward.dottedline": "M4 8h16M4 12h16M4 16h16",
  burst: "M12 2l1 6 6-2-3 6 6 2-6 3 3 6-6-2-1 6-1-6-6 2 3-6-6-3 6-2-3-6 6 2z",
  "wand.and.rays": "M4 20l8-8M14 6l4 4M15 3v3M21 9h-3M19 4l-2 2M8 15l2 2",
  "rectangle.portrait.on.rectangle.portrait.angled": "M7 4h8v14H7zM10 7h8v14h-8",
  "slider.horizontal.below.rectangle": "M4 6h16v8H4zM6 18h4m4 0h4M12 16v4",
  "character.cursor.ibeam": "M8 5h8M12 5v14M8 19h8",
  "iphone.radiowaves.left.and.right": "M9 4h6v16H9zM5 9c-1 1-1 5 0 6m14-6c1 1 1 5 0 6",
  "light.max": "M12 4v2M6 6l1.5 1.5M18 6l-1.5 1.5M12 10a4 4 0 0 1 0 8v2",
  "light.beacon.max": "M12 3v4M6 6l2 2M16 8l2-2M12 9a4 4 0 0 1 2 7.5V21h-4v-4.5A4 4 0 0 1 12 9z",
  "barcode.viewfinder": "M4 8V4h4M16 4h4v4M4 16v4h4M20 16v4h-4M8 8v8M12 8v8M16 8v8",
  "circle.hexagongrid.fill": "M12 3l7 4v8l-7 4-7-4V7z",
  "sparkles.rectangle.stack.fill": "M5 8h14v12H5zM8 5h8",
  "circle.circle": "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  "apple.logo": "M16 7c1.5-2 4-2 4-2s-.2 3-2 4.5C16.5 11 15 11 14 10c-1.5 2.5-4 6-4 9 0 3 2 4 4 4s3-1 4-3c1 2 3 3 5 2-2-3-1-7 1-10-2 0-4-2-4-5 0-1 .5-3 .5-3S15.5 5 16 7zM12 4c.5-1.5 2-3 2-3s-2 .2-3 2C10 4.5 10 6 11 6c0-1 .5-2 1-2z",
  "drop.halffull": "M12 3s7 8 7 12a7 7 0 1 1-14 0c0-4 7-12 7-12z",
  "cloud.fill": "M7 17h11a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1A3.5 3.5 0 0 0 7 17z",
  "drop.fill": "M12 3s7 8 7 12a7 7 0 1 1-14 0c0-4 7-12 7-12z",
  "circle.lefthalf.filled": "M12 4a8 8 0 1 0 0 16V4z",
  "flame.fill": "M12 3c2 4-2 6 0 10 3-2 6 0 6 5a6 6 0 1 1-12 0c0-4 4-8 6-15z",
  "circle.dashed": "M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16",
  "circle.hexagonpath.fill": "M12 3l8 4.5v9L12 21l-8-4.5v-9z",
  "circle.grid.cross.fill": "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  "circle.grid.3x3": "M5 5h2v2H5zM11 5h2v2h-2zM17 5h2v2h-2zM5 11h2v2H5zM11 11h2v2h-2zM17 11h2v2h-2zM5 17h2v2H5zM11 17h2v2h-2zM17 17h2v2h-2z",
  "circle.grid.3x3.fill": "M5 5h2v2H5zM11 5h2v2h-2zM17 5h2v2h-2zM5 11h2v2H5zM11 11h2v2h-2zM17 11h2v2h-2zM5 17h2v2H5zM11 17h2v2h-2zM17 17h2v2h-2z",
  "drop.triangle.fill": "M12 3 21 20H3z",
  "waveform.path": "M3 12h2l2-6 2 12 2-10 2 8 2-4 2 2h4",
  "hexagon.fill": "M12 3l8 4.5v9L12 21l-8-4.5v-9z",
  "swirl.circle.righthalf.filled": "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 4a4 4 0 0 1 0 8",
  "fan.fill": "M12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm0-8c2 3 1 6 0 8-3-2-7-1-8 0 3 2 6 1 8 0 2 3 1 7 0 8 2-3 6-1 8 0-1-3-1-7 0-8 3 1 7 2 8 0-3-2-6-1-8 0C13 9 14 6 12 3z",
  hurricane: "M12 3c5 0 7 4 7 7 0 5-4 5-7 5s-7 0-7-5c0-3 2-7 7-7zm0 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  "globe.americas.fill": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 10c1-2 3-3 5-2s2 4 0 5-5 1-5-3z",
  "character.bubble.fill": "M5 5h14v10H9l-4 4z",
  "party.popper": "M4 20c4-4 8-6 16-8M8 8l2 2M6 4l1 3M3 8l3 1",
  atom: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm-8 4c2-6 14-6 16 0-2 6-14 6-16 0zm8-8c6 2 6 14 0 16-6-2-6-14 0-16z",
  "rectangle.expand.vertical": "M6 8h12v8H6zM12 3v3M12 18v3",
  "chart.xyaxis.line": "M4 20V6m0 14h16M6 16l4-6 3 3 5-7",
  "chart.line.uptrend.xyaxis": "M4 20V6m0 14h16M6 14l5-5 3 3 5-6",
  "chart.dots.scatter": "M6 16a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm6-6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm6 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  "chart.pie.fill": "M12 4a8 8 0 1 0 8 8h-8z",
  pentagon: "M12 3l9 6.5-3.5 10.5h-11L3 9.5z",
  "square.grid.3x3.fill": "M4 4h5v5H4zM9.5 4h5v5h-5zM15 4h5v5h-5zM4 9.5h5v5H4zM9.5 9.5h5v5h-5zM15 9.5h5v5h-5zM4 15h5v5H4zM9.5 15h5v5h-5zM15 15h5v5h-5z",
  "point.3.connected.trianglepath.dotted": "M6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM12 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM7.5 8.5l3.5 6m5.5-6-3.5 6M8 6h8",
  tag: "M3 12l9-9h7v7l-9 9zM16 7h.01",
  "tag.fill": "M3 12l9-9h7v7l-9 9z",
  "bubble.left.and.text.bubble.right": "M4 6h10v8H8l-4 3zM10 10h10v8h-6l-4 3z",
  "text.quote": "M6 8h5v5H8c0 3 2 4 3 5H6c-1-1-3-3-3-5 0-3 1.5-5 3-5zm9 0h5v5h-3c0 3 2 4 3 5h-5c-1-1-3-3-3-5 0-3 1.5-5 3-5z",
  "rectangle.3.group": "M4 6h7v5H4zM13 6h7v5h-7zM4 13h16v5H4z",
  "hand.wave.fill": "M8 9V5m3 5V3m3 7V6m3 6V8M7 12c0 5 2 9 5 9s5-4 5-9",
  "cup.and.saucer.fill": "M6 8h10v6a4 4 0 0 1-8 0zm10 1h2a2 2 0 0 1 0 4h-2M5 20h14",
  "rectangle.split.3x1.fill": "M4 6h5v12H4zM9.5 6h5v12h-5zM15 6h5v12h-5z",
  "text.badge.checkmark": "M5 6h10M5 10h7M5 14h5M16 12l2 2 4-4",
  "circle.dotted": "M12 4a8 8 0 1 0 .01 0z",
  photo: "M4 6h16v12H4zM8 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-2 7 4-5 3 3 2-2 5 4z",
  "photo.fill": "M4 6h16v12H4zM8 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-2 7 4-5 3 3 2-2 5 4z",
  "rectangle.stack.badge.plus": "M6 8h12v10H6zM8 5h12v3M12 12v4m-2-2h4",
  "wallet.bifold.fill": "M4 8h16v10H4zM4 8l8-3 8 3M16 13h2",
  "bell.badge": "M6 16h12l-1-6a5 5 0 0 0-10 0zM9 16a3 3 0 0 0 6 0M16 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  hourglass: "M7 4h10M7 20h10M8 4c0 5 8 5 8 8s-8 3-8 8m8-16c0 5-8 5-8 8s8 3 8 8",
  "ellipsis.bubble.fill": "M4 6h16v10H8l-4 4zM8 11h.01M12 11h.01M16 11h.01",
  plus: "M12 5v14M5 12h14",
  magnifyingglass: "M11 6a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm7 12-3-3",
  minus: "M5 12h14",
  xmark: "M6 6l12 12M18 6 6 18",
  checkmark: "M5 13l4 4L19 7",
  "doc.on.doc": "M8 7h9v12H8zM7 5h9v2",
  "slider.horizontal.3": "M4 8h16M4 12h16M4 16h16M8 6v4m6 0v4m-4 0v4",
  "line.3.horizontal.decrease.circle": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 9h8M8 12h6M8 15h4",
  "arrow.up": "M12 19V5m0 0 6 6M12 5 6 11",
  "dollarsign.circle.fill": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 4v10m-2-8c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2 1-2 2 1 2 2 2 2-1 2-2",
  calendar: "M5 6h14v13H5zM5 10h14M9 4v4m6-4v4",
  "person.2.fill": "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8-1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM4 19c0-3 2-5 5-5s5 2 5 5m3-5c2 0 4 1.5 4 4",
  "person.3.fill": "M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM5 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm14 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM7 19c0-2.5 2-4 5-4s5 1.5 5 4",
  heart: "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z",
  "heart.fill": "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z",
  "brain.head.profile": "M13 4a5 5 0 0 1 5 5c1.5.5 2 2 2 3.5S19 16 17 16h-1v4H8v-5H7a4 4 0 0 1-1-7 5 5 0 0 1 7-4z",
  tshirt: "M8 6l4-2 4 2 3-1v4l-3 1v10H8V10L5 9V5z",
  "tshirt.fill": "M8 6l4-2 4 2 3-1v4l-3 1v10H8V10L5 9V5z",
  "magnifyingglass.circle": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm-1 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm4.5 6.5L17 17",
  "creditcard": "M3 7h18v10H3zM3 11h18",
  "lock.shield": "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  "bell.badge.fill": "M6 16h12l-1-6a5 5 0 0 0-10 0zM9 16a3 3 0 0 0 6 0M17 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  "play.fill": "M8 6v12l10-6z",
  "pause.fill": "M7 6h3v12H7zM14 6h3v12h-3z",
  "arrow.left.and.right": "M4 12h16M8 8 4 12l4 4m8-8 4 4-4 4",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zm10-3a3 3 0 1 1 0 6 3 3 0 0 1 0-6z",
  "eye.slash": "M3 3l18 18M10 10a3 3 0 0 0 4 4M2 12s4-7 10-7c1.5 0 2.8.3 4 .9M22 12s-4 7-10 7c-1.5 0-2.8-.3-4-.9",
  "wand.and.stars": "M4 20l8-8M14 6l4 4M15 3v3M21 9h-3M19 4l-2 2M8 15l2 2",
  swift: "M4 16c6-2 10-8 14-12-2 6-2 10 2 14-6-1-11 0-16-2z",
  "xmark.circle": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm-3 6 6 6m0-6-6 6",
};

export function SWSymbol({
  name,
  size = 18,
  color = "currentColor",
  style,
  className,
}: {
  name: string;
  size?: number;
  color?: string;
  style?: CSSProperties;
  className?: string;
}) {
  const d = ICONS[name] ?? ICONS[name.replace(".fill", "")] ?? ICONS.sparkles;
  const fill = name.includes(".fill") || name.endsWith("fill") ? color : "none";
=======
  const fill = name.includes(".fill") || name === "apple.logo" ? color : "none";
>>>>>>> cursor/port-swmetal-wrappers-8ada
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill === "none" ? "none" : color}
      stroke={color}
      strokeWidth={fill === "none" ? 1.7 : 0}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}
