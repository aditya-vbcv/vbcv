/* ============================================================
   counters.js
   ------------------------------------------------------------
   Animates the numbers in the "School at a glance" band from 0
   up to their real value the first time they scroll into view.

   How it works, in plain English:
   1. Every number carries data-count-to (the target value) and an
      optional data-count-suffix (like "+" or "%").
   2. The final value is ALSO written in the HTML, so if JavaScript
      is switched off the correct number is simply shown as-is.
   3. An IntersectionObserver starts the count the first time the
      number appears on screen, then stops watching it.
   4. If the visitor prefers reduced motion we skip the count
      completely and leave the final value in place.

   To add a new counter, just write the final value in the HTML and
   add the two data- attributes. Nothing else to change here.
   ============================================================ */

(function () {
  "use strict";

  /* How long the count-up takes, in milliseconds. */
  var COUNT_MS = 1200;

  /* Gentle ease-out: the numbers sprint at first, then slow down
     as they land on the final value. */
  function easeOut(progress) {
    return 1 - Math.pow(1 - progress, 3);
  }

  /* Animate one number element. */
  function runCounter(el) {
    var target = Number(el.getAttribute("data-count-to"));
    if (isNaN(target)) {
      return;
    }

    var suffix = el.getAttribute("data-count-suffix") || "";
    var startTime = null;

    function frame(now) {
      if (startTime === null) {
        startTime = now;
      }

      var progress = Math.min((now - startTime) / COUNT_MS, 1);
      var value = Math.round(easeOut(progress) * target);

      el.textContent = value + suffix;

      if (progress < 1) {
        window.requestAnimationFrame(frame);
      } else {
        el.textContent = target + suffix; /* land exactly on target */
      }
    }

    if ("requestAnimationFrame" in window) {
      window.requestAnimationFrame(frame);
    } else {
      el.textContent = target + suffix;
    }
  }

  function init() {
    var items = document.querySelectorAll("[data-count-to]");
    var i;

    if (!items.length) {
      return;
    }

    var prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    /* No animation wanted (or no observer support): the HTML already
       shows the final values, so there is nothing to do. */
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      return;
    }

    /* We only reach here when we can animate, so it is safe to reset
       the numbers to zero while they wait for their turn. */
    for (i = 0; i < items.length; i++) {
      items[i].textContent =
        "0" + (items[i].getAttribute("data-count-suffix") || "");
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          runCounter(entry.target);
          obs.unobserve(entry.target); /* count only once */
        });
      },
      { threshold: 0.4 }
    );

    for (i = 0; i < items.length; i++) {
      observer.observe(items[i]);
    }
  }

  /* Run as soon as the DOM is ready. */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
