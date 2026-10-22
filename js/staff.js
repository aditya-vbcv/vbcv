/* ============================================================
   staff.js
   ------------------------------------------------------------
   Live search for the staff directory.

   Every person on the page is marked with data-staff-entry.
   The boxes around them (sections and sub-groups) are marked
   with data-staff-group, so they can disappear too when nothing
   inside them matches.

   If JavaScript is switched off, nothing here runs and the
   complete directory is still perfectly readable.
   ============================================================ */

(function () {
  "use strict";

  var input = document.getElementById("staff-search");
  var status = document.getElementById("staff-search-status");
  var emptyMessage = document.getElementById("staff-search-empty");

  // Nothing to do on pages without the search box
  if (!input) return;

  var entries = Array.prototype.slice.call(
    document.querySelectorAll("[data-staff-entry]")
  );
  var groups = Array.prototype.slice.call(
    document.querySelectorAll("[data-staff-group]")
  );
  var counters = Array.prototype.slice.call(
    document.querySelectorAll("[data-staff-count]")
  );
  var lead = document.querySelector(".staff-lead");
  var principal = document.querySelector(".staff-principal");

  var total = entries.length;

  // Remember each group's true size so clearing the search can
  // put the numbers back exactly as they were.
  counters.forEach(function (counter) {
    counter.setAttribute("data-total", counter.textContent.trim());
  });

  /* --------------------------------------------------------
     Filter everything. Called on every keystroke.
     -------------------------------------------------------- */
  function applyFilter() {
    var query = input.value.trim().toLowerCase();
    var shown = 0;

    // 1. Show or hide each person
    entries.forEach(function (entry) {
      var text = (entry.getAttribute("data-search") || entry.textContent)
        .toLowerCase();
      var match = query === "" || text.indexOf(query) !== -1;

      entry.hidden = !match;
      if (match) shown = shown + 1;
    });

    // 2. Hide any group (and section) that has no visible people
    groups.forEach(function (group) {
      var visible = group.querySelectorAll(
        "[data-staff-entry]:not([hidden])"
      ).length;
      group.hidden = visible === 0;
    });

    // If the principal has been filtered out, let the
    // vice-principal cards use the full width.
    if (lead && principal) {
      lead.classList.toggle("staff-lead--compact", principal.hidden);
    }

    // 3. Update the little numbers beside each group name
    counters.forEach(function (counter) {
      var group = counter.closest("[data-staff-group]");
      if (!group) return;

      if (query === "") {
        counter.textContent = counter.getAttribute("data-total");
      } else {
        counter.textContent = group.querySelectorAll(
          "[data-staff-entry]:not([hidden])"
        ).length;
      }
    });

    // 4. Tell screen-reader users what happened
    if (status) {
      status.textContent =
        query === ""
          ? total + " members"
          : shown + " of " + total + " members shown";
    }

    // 5. "No results" message
    if (emptyMessage) {
      emptyMessage.hidden = shown !== 0;
    }
  }

  input.addEventListener("input", applyFilter);

  // The small "clear" cross in some browsers fires "search"
  input.addEventListener("search", applyFilter);

  // Run once so the status text matches the real number of entries
  applyFilter();
})();
