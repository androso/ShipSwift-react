/**
 * Reusable label components that pair a leading visual (SF Symbol or image
 * resource) with a text name. Commonly used in list rows, settings screens,
 * or menu items.
 *
 * Usage:
 *   <SWLabelWithIcon icon="gearshape" bg="var(--sw-orange)" name="Settings" />
 *   <SWLabelWithImage image="/demo/fullpack-logo.png" name="FullPack" />
 */
import { SWSymbol } from "@/swpackage/swutil";

export function SWLabelWithIcon({
  icon = "pencil",
  bg = "var(--sw-blue)",
  name = "Name",
}: {
  icon?: string;
  bg?: string;
  name?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: `linear-gradient(180deg, ${bg}, color-mix(in srgb, ${bg} 70%, #000))`,
          opacity: 0.9,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          margin: 5,
          flexShrink: 0,
        }}
      >
        <SWSymbol name={icon} size={16} color="rgba(255,255,255,0.92)" />
      </span>
      <span>{name}</span>
    </div>
  );
}

export function SWLabelWithImage({
  image = "/demo/fullpack-logo.png",
  name = "Name",
}: {
  image?: string;
  name?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <img
        src={image}
        alt=""
        style={{
          width: 32,
          height: 32,
          objectFit: "contain",
          borderRadius: 6,
          margin: 5,
        }}
      />
      <span>{name}</span>
    </div>
  );
}
