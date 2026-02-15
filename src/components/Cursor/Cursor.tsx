import { useEffect } from "react";
import "./styles.css";

export default function Cursor() {
  // ANCHOR STATES && VARIABLES

  // ANCHOR EFFECTS
  useEffect(() => {
    const bodyElement = document.body;

    bodyElement.addEventListener("mousemove", mouseMoveListner);

    return () => {
      bodyElement.removeEventListener("mousemove", mouseMoveListner);
    };
  }, []);

  // ANCHOR FUNCTIONS
  const mouseMoveListner = ({
    clientX,
    clientY,
  }: {
    clientX: number;
    clientY: number;
  }) => {
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
          // Remove light-mode if difference is active to prevent conflicts, 
          // or rely on CSS specificity. Let's rely on CSS !important for difference.
        }

        if (elementUnderCursor.closest(".__cursor-hover")) {
          // For general hover effect (scale up)
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
