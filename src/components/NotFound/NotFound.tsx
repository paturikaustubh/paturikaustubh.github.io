import { useEffect } from "react";

import { TransitionOverlay } from "../../Transition/transition";

import "./styles.css";

export default function NotFound() {
  useEffect(() => {
    const navEle = document.querySelector("nav");
    if (navEle) {
      navEle.classList.remove("sticky");
      navEle.classList.add("fixed");
    }
    const footerEle = document.querySelector("footer");
    if (footerEle) footerEle.classList.add("hidden");
  });

  return (
    <TransitionOverlay>
      <section className="not-found">
        <div className="title __cursor-blend">
          <span className="number">404</span>
          <span className="text">Oops! Wrong turn</span>
        </div>
      </section>
    </TransitionOverlay>
  );
}
