/* ============================================================
   animations.js
   ------------------------------------------------------------
   The scroll-reveal system.

   What it does, in plain English:
   1. Finds every element in the page that has a "data-reveal"
      attribute.
   2. Watches each one with an IntersectionObserver.
   3. The moment an element scrolls into view, it adds the class
      ".is-visible" (the CSS then fades/slides it into place).
   4. It only ever reveals an element ONCE, then stops watching it.

   Options you can add in the HTML:
     data-reveal="up"        direction: up | left | right | zoom
     data-reveal-delay="150" delay in milliseconds (for staggering)

   Accessibility: if the visitor prefers reduced motion, or the
   browser is very old, every element is simply shown at once.
   ============================================================ */

(function () {
  "use strict";

  /* Show everything right away (fallback + reduced motion) */
  function revealAll() {
    var items = document.querySelectorAll("[data-reveal]");
    var i;
    for (i = 0; i < items.length; i++) {
      items[i].classList.add("is-visible");
    }
  }

  function init() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) {
      return;
    }

    var prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    /* No animation wanted, or the browser cannot observe scrolling:
       just make sure nothing stays hidden. */
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealAll();
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          var el = entry.target;

          /* Read the optional stagger delay (e.g. 150) and pass it
             to CSS through a custom property. */
          var delay = el.getAttribute("data-reveal-delay");
          if (delay) {
            el.style.setProperty("--reveal-delay", delay + "ms");
          }

          el.classList.add("is-visible");
          obs.unobserve(el); /* reveal only once */
        });
      },
      {
        /* Fire a little before the element is fully on screen,
           and ignore the very bottom edge of the viewport. */
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    Array.prototype.forEach.call(items, function (el) {
      observer.observe(el);
    });
  }

  /* Run as soon as the DOM is ready (works whether the script is
     loaded in <head> with defer, or at the end of <body>). */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
