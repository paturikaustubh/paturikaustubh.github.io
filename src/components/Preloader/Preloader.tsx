import { useEffect, useState } from "react";

/** Boot screen shown on every hard load (any route). The app mounts only
 *  after fonts + window load are ready, so all entry animations start on an
 *  idle main thread with correct font metrics. The overlay matches the
 *  transition curtain's cream so the handoff is invisible. */
export default function Preloader({ done }: { done: boolean }) {
  const [exiting, setExiting] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (!done) return;
    setExiting(true);
    const t = setTimeout(() => setGone(true), 650);
    return () => clearTimeout(t);
  }, [done]);

  if (gone) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000000,
        backgroundColor: "#efe9e1",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        opacity: exiting ? 0 : 1,
        transition: "opacity 450ms ease 120ms",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: 180,
          height: 2,
          backgroundColor: "rgba(20, 17, 14, 0.12)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            backgroundColor: "#c2410c",
            borderRadius: 999,
            transformOrigin: "left",
            animation: "preload-fill 2.2s cubic-bezier(0.19, 1, 0.22, 1) forwards",
          }}
        />
      </div>
    </div>
  );
}
