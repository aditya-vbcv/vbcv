/* ============================================================
   slider.js
   ------------------------------------------------------------
   The hero slideshow.

   Features:
   - Cross-fade between slides (the CSS does the fading).
   - Slow Ken Burns zoom on the live slide.
   - Autoplay, paused on hover, on touch, on keyboard focus, when
     the browser tab is hidden, and when the hero is off-screen.
   - Dots + previous/next arrows (keyboard operable).
   - Swipe left/right on touch devices.

   Respects prefers-reduced-motion: no autoplay, no zoom.
   Markup lives in html/index.html, styles in css/hero.css.
   ============================================================ */

(function () {
  "use strict";

  var hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }

  var slides = hero.querySelectorAll(".hero__slide");
  var dots = hero.querySelectorAll(".hero__dot");
  var prevBtn = hero.querySelector(".hero__arrow--prev");
  var nextBtn = hero.querySelector(".hero__arrow--next");

  if (slides.length < 2) {
    if (slides[0]) {
      slides[0].classList.add("is-active");
    }
    return;
  }

  /* ----------------------------------------------------------
     HOW LONG EACH SLIDE STAYS ON SCREEN (milliseconds)
     ----------------------------------------------------------
     Change this ONE number to speed the slideshow up or slow it
     down. The Ken Burns zoom duration is matched to it automatically,
     so you never need to edit the CSS.
       60000  = 60 seconds (current)
       10000  = 10 seconds
       5000   = 5 seconds
     ---------------------------------------------------------- */
  var SLIDE_INTERVAL_MS = 60000;

  var FADE_MS = 1200;     /* cross-fade length - must match hero.css */
  var SWIPE_MIN = 40;     /* minimum px for a swipe to count */

  var current = 0;
  var timer = null;
  var paused = false;     /* true while hovering / touching / focused */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Keep the Ken Burns zoom in step with the slide timing: the zoom
     lasts exactly as long as the slide is shown, so it drifts along
     slowly and continuously instead of finishing early or snapping. */
  hero.style.setProperty("--kb-duration", SLIDE_INTERVAL_MS + "ms");

  /* ----------------------------------------------------------
     Show a specific slide
     ---------------------------------------------------------- */
  function show(index) {
    index = (index + slides.length) % slides.length;
    if (index === current) {
      return;
    }

    var previous = slides[current];

    /* Freeze the outgoing slide's zoom while it fades, then let it
       reset (invisibly) once the fade is done. */
    previous.classList.remove("is-active");
    previous.classList.add("is-leaving");
    (function (el) {
      window.setTimeout(function () {
        el.classList.remove("is-leaving");
      }, FADE_MS);
    })(previous);

    slides[index].classList.add("is-active");
    current = index;
    updateDots();
  }

  function next() {
    show(current + 1);
  }

  function prev() {
    show(current - 1);
  }

  function updateDots() {
    for (var i = 0; i < dots.length; i++) {
      if (i === current) {
        dots[i].setAttribute("aria-current", "true");
      } else {
        dots[i].removeAttribute("aria-current");
      }
    }
  }

  /* ----------------------------------------------------------
     Autoplay
     ---------------------------------------------------------- */
  function startAutoplay() {
    if (reduceMotion || paused || document.hidden) {
      return;
    }
    stopAutoplay();
    timer = window.setInterval(next, SLIDE_INTERVAL_MS);
  }

  function stopAutoplay() {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  /* Restart the countdown after a manual change, so an arrow tap
     is not instantly followed by an automatic advance. */
  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  /* ----------------------------------------------------------
     Controls
     ---------------------------------------------------------- */
  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      next();
      restartAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      prev();
      restartAutoplay();
    });
  }

  Array.prototype.forEach.call(dots, function (dot, i) {
    dot.addEventListener("click", function () {
      show(i);
      restartAutoplay();
    });
  });

  /* Left/right arrow keys while any control has focus */
  hero.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
      prev();
      restartAutoplay();
    } else if (event.key === "ArrowRight") {
      next();
      restartAutoplay();
    }
  });

  /* ----------------------------------------------------------
     Pause on hover / touch / focus
     ---------------------------------------------------------- */
  function pause() {
    paused = true;
    stopAutoplay();
  }

  function resume() {
    paused = false;
    startAutoplay();
  }

  hero.addEventListener("mouseenter", pause);
  hero.addEventListener("mouseleave", resume);
  hero.addEventListener("focusin", pause);
  hero.addEventListener("focusout", resume);

  /* ----------------------------------------------------------
     Swipe (touch)
     ---------------------------------------------------------- */
  var startX = 0;
  var startY = 0;
  var tracking = false;

  hero.addEventListener(
    "touchstart",
    function (event) {
      pause();
      var touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      tracking = true;
    },
    { passive: true }
  );

  hero.addEventListener(
    "touchend",
    function (event) {
      resume();
      if (!tracking) {
        return;
      }
      tracking = false;

      var touch = event.changedTouches[0];
      var dx = touch.clientX - startX;
      var dy = touch.clientY - startY;

      /* Only treat it as a swipe when the movement is mostly
         horizontal, so vertical page scrolling still works. */
      if (Math.abs(dx) > SWIPE_MIN && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) {
          next();
        } else {
          prev();
        }
      }
    },
    { passive: true }
  );

  /* ----------------------------------------------------------
     Pause when the tab is hidden or the hero is off-screen
     ---------------------------------------------------------- */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) {
          startAutoplay();
        } else {
          stopAutoplay();
        }
      },
      { threshold: 0.15 }
    ).observe(hero);
  }

  /* ----------------------------------------------------------
     Go
     ---------------------------------------------------------- */
  updateDots();
  startAutoplay();
})();
