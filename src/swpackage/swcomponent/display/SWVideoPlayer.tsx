/**
 * A video showcase player with a paused first-frame / poster preview and a
 * center play button. Tapping opens an HTML5 fullscreen player overlay.
 *
 * Usage:
 *   <SWVideoPlayer url="/demo/spacex_demo.mp4" poster="/demo/galaxy.jpg" />
 *   <SWVideoPlayer resource="spacex_demo" ext="mp4" />
 */
import { useEffect, useRef, useState } from "react";
import { SWSymbol } from "@/swpackage/swutil";

export function SWVideoPlayer({
  url,
  resource,
  ext = "mp4",
  cornerRadius = 20,
  poster = "/demo/galaxy.jpg",
  onEnterFullscreen,
  onExitFullscreen,
}: {
  url?: string;
  resource?: string;
  ext?: string;
  cornerRadius?: number;
  poster?: string;
  onEnterFullscreen?: () => void;
  onExitFullscreen?: () => void;
}) {
  const videoURL = url ?? (resource ? `/demo/${resource}.${ext}` : undefined);
  const [showFullscreen, setShowFullscreen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowFullscreen(true)}
        style={{
          position: "relative",
          display: "block",
          width: "100%",
          aspectRatio: "16 / 9",
          border: "none",
          padding: 0,
          borderRadius: cornerRadius,
          overflow: "hidden",
          background: "#111",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15)",
        }}
      >
        {videoURL ? (
          <video
            src={videoURL}
            poster={poster}
            muted
            playsInline
            preload="metadata"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <img
            src={poster}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        <span
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.25)",
          }}
        />
        <span
          className="sw-ultra-thin"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 64,
            height: 64,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.25)",
          }}
        >
          <SWSymbol name="play.fill" size={28} color="#fff" />
        </span>
      </button>

      {showFullscreen && (
        <SWVideoFullscreenPlayer
          src={videoURL}
          poster={poster}
          onClose={() => setShowFullscreen(false)}
          onEnter={onEnterFullscreen}
          onExit={onExitFullscreen}
        />
      )}
    </>
  );
}

function SWVideoFullscreenPlayer({
  src,
  poster,
  onClose,
  onEnter,
  onExit,
}: {
  src?: string;
  poster: string;
  onClose: () => void;
  onEnter?: () => void;
  onExit?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    onEnter?.();
    void videoRef.current?.play().catch(() => undefined);
    return () => {
      videoRef.current?.pause();
      onExit?.();
    };
  }, [onEnter, onExit]);

  return (
    <div className="sw-video-fullscreen">
      {src ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          controls
          autoPlay
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      ) : (
        <img
          src={poster}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      )}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="sw-ultra-thin"
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SWSymbol name="xmark" size={16} color="#fff" />
      </button>
    </div>
  );
}
