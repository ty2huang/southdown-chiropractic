(function () {
  "use strict";

  document.documentElement.classList.add("js");

  // Weekly hours in clinic local time, 24h. Index matches Date#getDay (0 = Sunday).
  var HOURS = [
    null,           // Sunday
    [9, 20],        // Monday
    null,           // Tuesday
    [9, 20],        // Wednesday
    [10, 20],       // Thursday
    null,           // Friday
    [9, 15]         // Saturday
  ];
  var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var TIME_ZONE = "America/Toronto";

  function formatHour(h) {
    var suffix = h >= 12 ? "pm" : "am";
    var hr = h % 12 === 0 ? 12 : h % 12;
    return hr + " " + suffix;
  }

  // Current day and fractional hour in the clinic's time zone, regardless of the visitor's.
  function clinicNow() {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23"
    }).formatToParts(new Date());
    var get = function (type) {
      var p = parts.find(function (x) { return x.type === type; });
      return p ? p.value : "";
    };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    return { day: day, hour: Number(get("hour")) + Number(get("minute")) / 60 };
  }

  function nextOpening(fromDay, fromHour) {
    for (var i = 0; i < 8; i++) {
      var d = (fromDay + i) % 7;
      var h = HOURS[d];
      if (h && (i > 0 || fromHour < h[0])) {
        var when = i === 0 ? "today" : i === 1 ? "tomorrow" : DAY_NAMES[d];
        return "Opens " + when + " at " + formatHour(h[0]);
      }
    }
    return "";
  }

  function renderHours() {
    var now = clinicNow();
    if (now.day < 0) return;

    var today = HOURS[now.day];
    var isOpen = !!today && now.hour >= today[0] && now.hour < today[1];
    var state = isOpen ? "Open now" : "Closed now";
    var detail = isOpen
      ? "Until " + formatHour(today[1]) + " today"
      : nextOpening(now.day, now.hour);

    var row = document.querySelector('[data-hours] tr[data-day="' + now.day + '"]');
    if (row) row.classList.add("is-today");

    var pill = document.querySelector("[data-open-pill]");
    if (pill) {
      pill.textContent = state;
      pill.classList.toggle("is-open", isOpen);
      pill.hidden = false;
    }

    var card = document.querySelector("[data-status-card]");
    if (card) {
      card.classList.toggle("is-open", isOpen);
      card.querySelector("[data-status]").textContent = state;
      card.querySelector("[data-status-detail]").textContent = detail;
    }
  }

  function setupNav() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!header || !toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
    window.matchMedia("(min-width: 961px)").addEventListener("change", function (e) {
      if (e.matches) setOpen(false);
    });

    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function setupActiveLinks() {
    if (!("IntersectionObserver" in window)) return;
    var links = Array.prototype.slice.call(document.querySelectorAll('.site-nav ul a[href^="#"]'));
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-active"); });
        var link = byId[entry.target.id];
        if (link) link.classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  function setupReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { observer.observe(el); });
  }

  function setupContactForm() {
    var dialog = document.getElementById("contact-dialog");
    var form = document.getElementById("contact-form");
    var opener = document.querySelector("[data-contact-open]");
    if (!dialog || !form || !opener || typeof dialog.showModal !== "function") return;

    var status = form.querySelector("[data-contact-status]");

    opener.addEventListener("click", function (event) {
      event.preventDefault();
      status.textContent = "";
      dialog.showModal();
      document.body.classList.add("contact-is-open");
    });
    dialog.querySelector("[data-contact-close]").addEventListener("click", function () {
      dialog.close();
    });
    var pointerStartedOutside = false;
    function isOutsideDialog(event) {
      var bounds = dialog.getBoundingClientRect();
      return event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom;
    }
    dialog.addEventListener("pointerdown", function (event) {
      pointerStartedOutside = event.target === dialog && isOutsideDialog(event);
    });
    dialog.addEventListener("click", function (event) {
      if (pointerStartedOutside && event.target === dialog && isOutsideDialog(event)) {
        dialog.close();
      }
      pointerStartedOutside = false;
    });
    dialog.addEventListener("close", function () {
      pointerStartedOutside = false;
      document.body.classList.remove("contact-is-open");
      opener.focus({ preventScroll: true });
    });
    form.addEventListener("input", function () {
      status.textContent = "";
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      // Connect the email service here when it is ready.
      status.textContent = "Sending is not available yet. Your message has not been sent.";
    });
  }

  var year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  renderHours();
  setupNav();
  setupActiveLinks();
  setupReveal();
  setupContactForm();
})();
