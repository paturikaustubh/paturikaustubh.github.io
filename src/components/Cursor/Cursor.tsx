import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";
import "./styles.css";

export default function Cursor() {
  const mousePos = useRef({ x: -100, y: -100 });
  const cursorRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || window.matchMedia("(pointer: coarse)").matches) return;

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      xTo(e.clientX - 10);
      yTo(e.clientY - 10);
      applyModes(e.clientX, e.clientY);
    };

    document.body.addEventListener("mousemove", handleMouseMove);
    return () =>
      document.body.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mousePos.current.x !== -100)
        applyModes(mousePos.current.x, mousePos.current.y);
    }, 100);
    return () => clearTimeout(timer);
  }, [location]);

  const applyModes = (clientX: number, clientY: number) => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    const elementUnderCursor = document.elementFromPoint(clientX, clientY);
    const navElement = document.querySelector("nav");

    cursor.classList.remove(
      "mode-difference",
      "mode-hover",
      "mode-social",
      "animate-pulse-fast",
      "mode-nav",
    );

    if (navElement && navElement.contains(elementUnderCursor)) {
      cursor.classList.toggle(
        "light-mode",
        navElement.classList.contains("__header-inverted"),
      );
    } else {
      cursor.classList.toggle(
        "light-mode",
        !!elementUnderCursor?.closest(".__theme-change-dark") ||
          !!elementUnderCursor?.closest(".dark-footer"),
      );
    }

    if (elementUnderCursor) {
      if (elementUnderCursor.closest(".__cursor-difference"))
        cursor.classList.add("mode-difference");
      if (elementUnderCursor.closest(".__cursor-hover"))
        cursor.classList.add("mode-hover");
      if (elementUnderCursor.closest(".__cursor-nav"))
        cursor.classList.add("mode-nav");
      if (elementUnderCursor.closest(".__custom-cursor-social"))
        cursor.classList.add("mode-social", "animate-pulse-fast");
    }
  };

  return <div ref={cursorRef} className="__custom-cursor" />;
}
