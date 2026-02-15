import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./styles.css";

export default function Cursor() {
  // ANCHOR STATES && VARIABLES
  const mousePos = useRef({ x: -100, y: -100 });
  const location = useLocation();

  // ANCHOR EFFECTS
  useEffect(() => {
    const bodyElement = document.body;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      updateCursor(e.clientX, e.clientY);
    };

    bodyElement.addEventListener("mousemove", handleMouseMove);

    return () => {
      bodyElement.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    // Re-check cursor state on location change using last known position
    // Add a small delay to allow DOM to settle/mount completely
    const timer = setTimeout(() => {
      if (mousePos.current.x !== -100) {
        updateCursor(mousePos.current.x, mousePos.current.y);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [location]);

  // ANCHOR FUNCTIONS
  const updateCursor = (clientX: number, clientY: number) => {
    const cursor = document.querySelector<HTMLDivElement>(".__custom-cursor");
    const projectImgSection = document.querySelector<HTMLImageElement>(
      ".__projects-img-section",
    );

    const elementUnderCursor = document.elementFromPoint(clientX, clientY);
    const navElement = document.querySelector("nav");

    // Reset cursor classes first
    if (cursor) {
      cursor.classList.remove("mode-difference", "mode-hover", "mode-social", "animate-pulse-fast", "mode-nav");

      // Theme Dark Check (Light Mode Cursor)
      if (navElement && navElement.contains(elementUnderCursor)) {
        if (navElement.classList.contains("__header-inverted")) {
          cursor.classList.add("light-mode");
        } else {
          cursor.classList.remove("light-mode");
        }
      } else if (elementUnderCursor?.closest(".__theme-change-dark")) {
        cursor.classList.add("light-mode");
      } else {
        cursor.classList.remove("light-mode");
      }

      // Interaction Checks
      if (elementUnderCursor) {
        if (elementUnderCursor.closest(".__cursor-difference")) {
          cursor.classList.add("mode-difference");
        }

        if (elementUnderCursor.closest(".__cursor-hover")) {
          cursor.classList.add("mode-hover");
        }

        if (elementUnderCursor.closest(".__cursor-nav")) {
          cursor.classList.add("mode-nav");
        }

        if (elementUnderCursor.closest(".__custom-cursor-social")) {
          cursor.classList.add("mode-social", "animate-pulse-fast");
        }
      }
    }

    cursor?.animate(
      {
        left: `${clientX - 10}px`,
        top: `${clientY - 10}px`,
      },
      { duration: 500, fill: "forwards" },
    );
    projectImgSection?.animate(
      {
        left: `${clientX - 10}px`,
        top: `${clientY - 10}px`,
      },
      { duration: 1600, fill: "forwards" },
    );
  };

  return (
    <div
      className="__custom-cursor"
    />
  );
}
