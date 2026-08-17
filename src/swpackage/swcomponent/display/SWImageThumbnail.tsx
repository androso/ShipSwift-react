/**
 * Square image thumbnail with a same-named color fallback. Designed for
 * product cards, list rows, cart items, and detail headers where a polished
 * image tile is needed without bespoke loading-state UI.
 *
 * If the image is missing, still decoding, or partially transparent, the
 * generated tint fills the tile instead of a generic gray placeholder.
 *
 * Usage:
 *   <SWImageThumbnail imageName="latte" />
 *   <SWImageThumbnail imageName="matcha" size={60} cornerRadius={12} />
 */
import { useState } from "react";

function fallbackColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 32% 52%)`;
}

function resolveSrc(imageName: string): string {
  if (
    imageName.startsWith("/") ||
    imageName.startsWith("http://") ||
    imageName.startsWith("https://") ||
    imageName.startsWith("data:")
  ) {
    return imageName;
  }
  const kebab = imageName
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();
  return `/demo/${kebab}.png`;
}

export function SWImageThumbnail({
  imageName,
  size = 120,
  cornerRadius = 18,
}: {
  /** Asset name. Looked up under `/demo/` (kebab-case) as both image and tint. */
  imageName: string;
  /** Tile width and height. The thumbnail is always square. */
  size?: number;
  /** Continuous corner radius applied to both the clip shape and the border. */
  cornerRadius?: number;
}) {
  const [failed, setFailed] = useState(false);
  const src = resolveSrc(imageName);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: cornerRadius,
        background: fallbackColor(imageName),
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)",
      }}
    >
      {!failed && (
        <img
          src={src}
          alt=""
          onError={() => setFailed(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}
    </div>
  );
}
