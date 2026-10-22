/* ============================================================
   navbar.js
   ------------------------------------------------------------
   1. Sticky navbar: adds .is-scrolled once the visitor scrolls,
      which turns the transparent bar solid and shrinks it.
   2. Mobile drawer: open/close, slide animation, focus trap,
      Escape to close, backdrop click to close.
   3. Drawer accordion: expand/collapse the sub-menus.

   Markup lives in html/index.html, styles in css/navbar.css.
   ============================================================ */

(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var drawer = document.getElementById("mobile-drawer");

  if (!header) {
    return; /* nothing to do without a navbar */
  }

  /* ----------------------------------------------------------
     1. STICKY NAVBAR - SOLID ON SCROLL
     ---------------------------------------------------------- */
  var SCROLL_THRESHOLD = 40; /* px scrolled before the bar turns solid */

  function updateHeaderState() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  updateHeaderState(); /* set the correct state on load */
  window.addEventListener("scroll", updateHeaderState, { passive: true });

  /* Stop here if the drawer markup/button is missing */
  if (!drawer || !toggle) {
    return;
  }

  var panel = drawer.querySelector(".drawer__panel");
  var closeThings = drawer.querySelectorAll("[data-drawer-close]");
  var lastFocused = null;
  var hideTimer = null;

  /* ----------------------------------------------------------
     2. MOBILE DRAWER
     ---------------------------------------------------------- */
  function getFocusable() {
    return panel.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), ' +
      'select:not([disabled]), textarea:not([disabled]), ' +
      '[tabindex]:not([tabindex="-1"])'
    );
  }

  function openDrawer() {
    lastFocused = document.activeElement;

    clearTimeout(hideTimer);
    drawer.hidden = false;
    void drawer.offsetWidth; /* let the browser see the change, so it animates */

    drawer.classList.add("is-open");
    document.body.classList.add("drawer-open");
    toggle.classList.add("is-active");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");

    panel.focus(); /* move focus into the drawer */
  }

  function closeDrawer() {
    if (!drawer.classList.contains("is-open")) {
      return;
    }

    drawer.classList.remove("is-open");
    document.body.classList.remove("drawer-open");
    toggle.classList.remove("is-active");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");

    /* Fully hide once the slide-out finishes */
    hideTimer = setTimeout(function () {
      drawer.hidden = true;
    }, 400);

    /* Return focus to the hamburger (or whatever opened it) */
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    } else {
      toggle.focus();
    }
  }

  /* Hamburger button toggles the drawer */
  toggle.addEventListener("click", function () {
    if (drawer.classList.contains("is-open")) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  /* Close button + backdrop */
  Array.prototype.forEach.call(closeThings, function (el) {
    el.addEventListener("click", closeDrawer);
  });

  /* Close the drawer after tapping any link inside it, so the
     visitor can see the section they jumped to. */
  Array.prototype.forEach.call(drawer.querySelectorAll("a[href]"), function (link) {
    link.addEventListener("click", closeDrawer);
  });

  /* ----------------------------------------------------------
     3. DRAWER ACCORDION
     ---------------------------------------------------------- */
  Array.prototype.forEach.call(
    drawer.querySelectorAll(".drawer-menu__toggle"),
    function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".drawer-menu__item");
        var nowOpen = item.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", nowOpen ? "true" : "false");
      });
    }
  );

  /* ----------------------------------------------------------
     Keyboard: Escape closes; Tab is trapped inside the drawer
     ---------------------------------------------------------- */
  document.addEventListener("keydown", function (event) {
    if (!drawer.classList.contains("is-open")) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeDrawer();
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

    if (document.activeElement === panel) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* ----------------------------------------------------------
     If the window grows to desktop width, close the drawer
     ---------------------------------------------------------- */
  window.addEventListener("resize", function () {
    if (window.innerWidth >= 1024 && drawer.classList.contains("is-open")) {
      closeDrawer();
    }
  });
})();
