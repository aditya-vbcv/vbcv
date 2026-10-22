/* ============================================================
   popup.js
   ------------------------------------------------------------
   Controls the Notice Board popup.

   Behaviour:
   - Opens automatically ~600ms after EVERY page load
     (no "show once" logic, no localStorage).
   - Closes when the visitor: clicks the X button, clicks the
     dimmed backdrop, or presses the Escape key.
   - Locks page scrolling, keeps keyboard focus trapped inside
     the dialog, and returns focus to where it was on close.

   The matching styles live in css/popup.css.
   ============================================================ */

(function () {
  "use strict";

  /* How long to wait after page load before showing (ms) */
  var OPEN_DELAY = 600;

  /* How long the fade-out takes, so we can hide the element
     from screen readers only after the animation finishes (ms) */
  var CLOSE_DELAY = 400;

  var popup = document.getElementById("notice-popup");
  if (!popup) {
    return; /* nothing to do if the markup is missing */
  }

  var dialog = popup.querySelector(".popup__dialog");
  var closeButtons = popup.querySelectorAll("[data-popup-close]");

  var previouslyFocused = null; /* element to focus again on close */
  var hideTimer = null;

  /* ----------------------------------------------------------
     List every focusable element inside the dialog.
     Used by the focus trap.
     ---------------------------------------------------------- */
  function getFocusable() {
    return dialog.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), ' +
      'select:not([disabled]), textarea:not([disabled]), ' +
      '[tabindex]:not([tabindex="-1"])'
    );
  }

  /* ----------------------------------------------------------
     Open the popup
     ---------------------------------------------------------- */
  function openPopup() {
    previouslyFocused = document.activeElement;

    clearTimeout(hideTimer);
    popup.hidden = false;

    /* Force the browser to register the "hidden" change before we
       add .is-open, otherwise the transition is skipped. */
    void popup.offsetWidth;

    popup.classList.add("is-open");
    document.body.classList.add("popup-open");

    /* Move focus into the dialog (safe target thanks to tabindex="-1") */
    dialog.focus();
  }

  /* ----------------------------------------------------------
     Close the popup
     ---------------------------------------------------------- */
  function closePopup() {
    if (!popup.classList.contains("is-open")) {
      return;
    }

    popup.classList.remove("is-open");
    document.body.classList.remove("popup-open");

    /* Hide only after the fade-out completes */
    hideTimer = setTimeout(function () {
      popup.hidden = true;
    }, CLOSE_DELAY);

    /* Give focus back to the element that had it before opening */
    if (previouslyFocused && typeof previouslyFocused.focus === "function") {
      previouslyFocused.focus();
    }
  }

  /* ----------------------------------------------------------
     Close on X button / backdrop click
     ---------------------------------------------------------- */
  Array.prototype.forEach.call(closeButtons, function (el) {
    el.addEventListener("click", closePopup);
  });

  /* ----------------------------------------------------------
     Keyboard: Escape closes, Tab is trapped inside the dialog
     ---------------------------------------------------------- */
  document.addEventListener("keydown", function (event) {
    if (!popup.classList.contains("is-open")) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closePopup();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    var focusable = getFocusable();
    if (!focusable.length) {
      event.preventDefault();
      return;
    }

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    /* If focus is sitting on the dialog itself, send it to the
       first (or, with Shift, the last) control inside. */
    if (document.activeElement === dialog) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }

    /* Otherwise wrap around at the edges */
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* ----------------------------------------------------------
     Show it shortly after the page loads
     ---------------------------------------------------------- */
  window.addEventListener("load", function () {
    setTimeout(openPopup, OPEN_DELAY);
  });
})();
