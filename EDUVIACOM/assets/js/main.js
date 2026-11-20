/* ==========================================================================
   EDUVIA — Site interactions
   No dependencies. Progressive enhancement.
   ========================================================================== */

(function () {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const STORAGE = {
    requests: "eduvia_requests_v1",
    messages: "eduvia_messages_v1",
    services: "eduvia_services_v1",
    portfolio: "eduvia_portfolio_v1",
    settings: "eduvia_settings_v1"
  };

  /* -----------------------------------------------------------------------
     Icon sprite
     ----------------------------------------------------------------------- */

  const ICONS = {
    arrow: '<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    "check-circle": '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.3 2.3 4.7-4.7"/>',
    sparkle: '<path d="M12 3.5c.55 4.15 2.35 5.95 6.5 6.5-4.15.55-5.95 2.35-6.5 6.5-.55-4.15-2.35-5.95-6.5-6.5 4.15-.55 5.95-2.35 6.5-6.5Z"/><path d="M19 17.2c.2 1.5.85 2.15 2.35 2.35-1.5.2-2.15.85-2.35 2.35-.2-1.5-.85-2.15-2.35-2.35 1.5-.2 2.15-.85 2.35-2.35Z"/>',
    presentation: '<path d="M4 4h16v11H4z"/><path d="M2 20h20M12 15v5M8 8h8M8 11h5"/>',
    summary: '<path d="M3 5.5c3.6-1.2 6.6-.7 9 1.5 2.4-2.2 5.4-2.7 9-1.5V20c-3.6-1.2-6.6-.7-9 1.5-2.4-2.2-5.4-2.7-9-1.5V5.5Z"/><path d="M12 7v14"/>',
    worksheet: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h7M9 16h7M9 8h2"/>',
    brochure: '<path d="M4 4h6v16H4zM10 4h4v16h-4zM14 4h6v16h-6z"/><path d="M6.5 8h1M12 8h.01M16.5 8h1"/>',
    activity: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/><path d="m8.5 15 2 2 4-4"/>',
    tool: '<path d="M9 18h6M10 21h4"/><path d="M8.5 14.5A6 6 0 1 1 15.5 14.5c-.9.65-1.5 1.35-1.5 2.5h-4c0-1.15-.6-1.85-1.5-2.5Z"/>',
    project: '<path d="M4 5h6l2 2h8v12H4z"/><path d="M8 12h8M8 16h5"/>',
    university: '<path d="m2 9 10-5 10 5-10 5L2 9Z"/><path d="M6 11v5c3.7 2.4 8.3 2.4 12 0v-5M22 9v6"/>',
    research: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5"/><circle cx="12" cy="14" r="2.5"/><path d="m14 16 2 2"/>',
    infographic: '<path d="M21 12a9 9 0 1 1-9-9v9h9Z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15V3.5Z"/>',
    report: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5"/><path d="m9 15 2 2 4-4"/>',
    whatsapp: '<path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3.5 20.5l1.4-4.3a8.5 8.5 0 1 1 15.6-4.6Z"/><path d="M8.2 7.7c.2-.45.4-.46.7-.47h.55c.2 0 .44.06.57.42l.7 1.7c.1.25.06.46-.1.66l-.55.68c-.17.2-.13.38 0 .6.5.85 1.4 1.9 2.6 2.5.26.14.45.12.62-.08l.7-.8c.16-.2.38-.24.62-.15l1.7.8c.28.13.44.2.5.3.06.1.06.58-.17 1.1-.24.53-1.16 1.02-1.65 1.06-.45.03-1.03.15-3.14-.77-2.5-1.1-4.06-3.66-4.18-3.83-.12-.17-.96-1.3-.96-2.48 0-1.18.6-1.76.83-2Z"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.5"/><path d="M17.5 6.5h.01"/>',
    x: '<path d="M4 4l16 16M20 4 4 20"/>',
    tiktok: '<path d="M14 4v9.5a4.5 4.5 0 1 1-4.5-4.5"/><path d="M14 6.5c1 2 2.5 3 5 3.2"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
    phone: '<path d="M8.5 3.5 6 4.7c-.8.4-1.2 1.4-.9 2.2 1.6 5.7 6.1 10.2 11.8 11.8.9.3 1.8-.1 2.2-.9l1.2-2.5-3.8-2-1.5 1.7a13 13 0 0 1-5.5-5.5l1.7-1.5-2-3.8Z"/>',
    pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
    palette: '<path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 1.2-3.6 2 2 0 0 1 1.2-3.6H18a3 3 0 0 0 3-3A9 9 0 0 0 12 3Z"/><path d="M7.5 11h.01M9 7.5h.01M13 6.5h.01M16 9h.01"/>',
    shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3 7.8 7.5 9.5 4.5-1.7 7.5-4.9 7.5-9.5V6L12 3Z"/><path d="m9 12 2 2 4-4"/>',
    star: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 19h16"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
    eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 9 19.36a1.7 1.7 0 0 0-1.87.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.64 15a1.7 1.7 0 0 0-1.56-1.03H3v-4h.08A1.7 1.7 0 0 0 4.64 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.64a1.7 1.7 0 0 0 1.03-1.56V3h4v.08A1.7 1.7 0 0 0 15 4.64a1.7 1.7 0 0 0 1.87-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.36 9a1.7 1.7 0 0 0 1.56 1.03H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z"/>',
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z"/>',
    message: '<path d="M21 12a8 8 0 0 1-8 8H5l-2 2V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z"/><path d="M8 11h8M8 15h5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/>',
    book: '<path d="M4 5.5c3-1 6-.6 8 1.5 2-2.1 5-2.5 8-1.5V20c-3-1-6-.6-8 1.5-2-2.1-5-2.5-8-1.5V5.5Z"/><path d="M12 7v14"/>',
    play: '<path d="m9 6 9 6-9 6V6Z"/>',
    zoom: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M8 11h6M11 8v6"/>',
    edit: '<path d="M4 20h4l11-11-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5h.01"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3Z"/>',
    send: '<path d="m21 3-8.5 18-2.3-7.2L3 11.5 21 3Z"/><path d="m10.2 13.8 4.3-4.3"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/>',
    chart: '<path d="M4 20V4M4 20h16"/><path d="M8 16v-5M12 16V8M16 16v-3M20 16V6"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    logout: '<path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5M15 8l4 4-4 4M19 12H9"/>',
    filter: '<path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    list: '<path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    "arrow-up-left": '<path d="M17 17 7 7M7 17V7h10"/>',
    quote: '<path d="M10 11H5.5A1.5 1.5 0 0 0 4 12.5V16a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-5c0-3-1-5-4-6M20 11h-4.5A1.5 1.5 0 0 0 14 12.5V16a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-5c0-3-1-5-4-6"/>',
    "file": '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5"/>',
    "check-square": '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m8 12 2.5 2.5L16 9"/>',
    "x-circle": '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>'
  };

  function injectIcons() {
    const sprite = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    sprite.setAttribute("class", "icon-sprite");
    sprite.setAttribute("aria-hidden", "true");
    sprite.setAttribute("focusable", "false");
    sprite.innerHTML = `<defs>${Object.entries(ICONS)
      .map(([name, paths]) => `<symbol id="i-${name}" viewBox="0 0 24 24">${paths}</symbol>`)
      .join("")}</defs>`;
    document.body.prepend(sprite);
  }

  /* -----------------------------------------------------------------------
     Storage helpers
     ----------------------------------------------------------------------- */

  function readStore(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (error) {
      return [];
    }
  }

  function writeStore(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      toast("تعذر حفظ البيانات في هذا المتصفح. قد تكون مساحة التخزين ممتلئة.");
      return false;
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  /* -----------------------------------------------------------------------
     Toast
     ----------------------------------------------------------------------- */

  let toastTimer;
  function toast(message) {
    let el = $(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      el.innerHTML = '<span class="toast__icon"><svg class="icon" aria-hidden="true"><use href="#i-info"></use></svg></span><span class="toast__message"></span>';
      document.body.append(el);
    }
    $(".toast__message", el).textContent = message;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), 4200);
  }

  /* -----------------------------------------------------------------------
     Header + navigation
     ----------------------------------------------------------------------- */

  function initHeader() {
    const header = $(".site-header");
    if (header) {
      const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    const toggle = $(".nav-toggle");
    const nav = $(".site-nav");
    if (!toggle || !nav) return;

    const closeNav = () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("is-locked");
    };

    toggle.addEventListener("click", () => {
      const open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("is-locked", open);
    });

    $$(".nav-item--dropdown").forEach((item) => {
      const link = $(".nav-link", item);
      if (!link) return;
      link.setAttribute("aria-haspopup", "true");
      link.setAttribute("aria-expanded", "false");

      link.addEventListener("click", (event) => {
        if (window.matchMedia("(max-width: 900px)").matches) {
          event.preventDefault();
          const open = !item.classList.contains("is-open");
          item.classList.toggle("is-open", open);
          link.setAttribute("aria-expanded", String(open));
        }
      });
    });

    $$(".site-nav a").forEach((link) => {
      link.addEventListener("click", () => {
        if (link.closest(".nav-item--dropdown") && link.classList.contains("nav-link") && window.matchMedia("(max-width: 900px)").matches) return;
        closeNav();
      });
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".site-header")) closeNav();
      if (!event.target.closest(".nav-item--dropdown")) {
        $$(".nav-item--dropdown").forEach((item) => {
          item.classList.remove("is-open");
          $(".nav-link", item)?.setAttribute("aria-expanded", "false");
        });
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });
  }

  /* -----------------------------------------------------------------------
     Reveal on scroll
     ----------------------------------------------------------------------- */

  function initReveal() {
    const elements = $$(".reveal");
    if (!elements.length) return;

    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
        el.classList.add("is-visible");
      } else {
        observer.observe(el);
      }
    });
  }

  /* -----------------------------------------------------------------------
     Filters
     ----------------------------------------------------------------------- */

  function initFilters() {
    $$("[data-filter-group]").forEach((group) => {
      const buttons = $$("[data-filter]", group);
      const targetSelector = group.dataset.filterGroup;
      const target = $(targetSelector);
      if (!target) return;

      const cards = () => $$("[data-category]", target);

      const refreshCounts = () => {
        buttons.forEach((button) => {
          const filter = button.dataset.filter;
          const countEl = $("[data-count]", button);
          if (!countEl) return;
          const count = filter === "all" ? cards().length : cards().filter((card) => card.dataset.category === filter).length;
          countEl.textContent = count;
        });
      };

      const apply = (filter) => {
        buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.filter === filter)));
        cards().forEach((card) => {
          const show = filter === "all" || card.dataset.category === filter;
          card.hidden = !show;
        });
        const visible = cards().filter((card) => !card.hidden);
        const empty = $(".empty-state", target.parentElement);
        if (empty) empty.hidden = visible.length > 0;
      };

      buttons.forEach((button) => {
        button.addEventListener("click", () => apply(button.dataset.filter));
      });

      refreshCounts();
      apply("all");

      target.addEventListener("eduvia:content-updated", () => {
        refreshCounts();
        const active = $('[aria-pressed="true"]', group);
        apply(active ? active.dataset.filter : "all");
      });
    });
  }

  /* -----------------------------------------------------------------------
     Tabs
     ----------------------------------------------------------------------- */

  function initTabs() {
    $$("[data-tabs]").forEach((tabs) => {
      const tabButtons = $$("[role='tab']", tabs);
      const panels = tabButtons.map((button) => document.getElementById(button.getAttribute("aria-controls"))).filter(Boolean);

      const activate = (button) => {
        tabButtons.forEach((item) => {
          const selected = item === button;
          item.setAttribute("aria-selected", String(selected));
          item.tabIndex = selected ? 0 : -1;
        });
        panels.forEach((panel) => {
          panel.hidden = panel.id !== button.getAttribute("aria-controls");
        });
      };

      tabButtons.forEach((button, index) => {
        button.addEventListener("click", () => activate(button));
        button.addEventListener("keydown", (event) => {
          let nextIndex = index;
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            const rtl = getComputedStyle(document.documentElement).direction === "rtl";
            const direction = event.key === "ArrowRight" ? 1 : -1;
            nextIndex = (index + (rtl ? -direction : direction) + tabButtons.length) % tabButtons.length;
          } else if (event.key === "Home") {
            nextIndex = 0;
          } else if (event.key === "End") {
            nextIndex = tabButtons.length - 1;
          } else {
            return;
          }
          event.preventDefault();
          activate(tabButtons[nextIndex]);
          tabButtons[nextIndex].focus();
        });
      });

      activate(tabButtons.find((button) => button.getAttribute("aria-selected") === "true") || tabButtons[0]);
    });
  }

  /* -----------------------------------------------------------------------
     Video
     ----------------------------------------------------------------------- */

  function initVideo() {
    const overlay = $(".video-overlay");
    const video = $(".video-frame video");
    if (!overlay || !video) return;

    overlay.addEventListener("click", () => {
      overlay.classList.add("is-hidden");
      video.controls = true;
      const play = video.play();
      if (play && typeof play.catch === "function") {
        play.catch(() => {
          overlay.classList.remove("is-hidden");
          toast("تعذر تشغيل الفيديو. يمكنك فتحه مباشرة من ملف الموقع.");
        });
      }
    });

    video.addEventListener("ended", () => {
      overlay.classList.remove("is-hidden");
      video.controls = false;
    });
  }

  /* -----------------------------------------------------------------------
     Editable contact settings (local dashboard preview)
     ----------------------------------------------------------------------- */

  function initSiteSettings() {
    let settings = {};
    try {
      settings = JSON.parse(localStorage.getItem(STORAGE.settings) || "{}");
    } catch (error) {
      settings = {};
    }
    if (!settings || typeof settings !== "object") return;

    const isRealEmail = (value) => value && !/\.example$/i.test(value) && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
    const digits = (value) => String(value || "").replace(/\D/g, "");
    const isRealPhone = (value) => digits(value).length >= 10;

    if (settings.email) {
      $$("[data-site-email]").forEach((el) => {
        el.textContent = settings.email;
        if (isRealEmail(settings.email)) {
          el.href = `mailto:${settings.email}`;
          el.removeAttribute("aria-disabled");
        }
      });
    }

    if (settings.phone) {
      $$("[data-site-phone]").forEach((el) => {
        el.textContent = settings.phone;
        if (isRealPhone(settings.phone)) {
          const normalized = settings.phone.replace(/\s/g, "");
          el.href = `tel:${normalized}`;
          el.removeAttribute("aria-disabled");
        }
      });
    }

    if (isRealPhone(settings.whatsapp)) {
      const whatsappDigits = digits(settings.whatsapp).replace(/^00/, "");
      $$("[data-whatsapp]").forEach((el) => {
        el.href = `https://wa.me/${whatsappDigits}`;
        el.target = "_blank";
        el.rel = "noopener noreferrer";
        el.removeAttribute("aria-disabled");
        delete el.dataset.disabledAction;
        const soon = $(".whatsapp-fab__soon", el);
        if (soon) soon.textContent = "متاح";
        const strong = $(".whatsapp-fab__text strong", el);
        if (strong) strong.textContent = "تواصل واتساب";
        const small = $(".whatsapp-fab__text small", el);
        if (small) small.textContent = "راسلنا مباشرة";
      });
    }

    const socials = [
      ["instagram", "instagram"],
      ["x", "x"],
      ["tiktok", "tiktok"]
    ];
    socials.forEach(([key, name]) => {
      if (!settings[key]) return;
      $$(`[data-social="${name}"]`).forEach((el) => {
        el.href = settings[key];
        el.target = "_blank";
        el.rel = "noopener noreferrer";
        el.removeAttribute("aria-disabled");
        delete el.dataset.disabledAction;
        $(".social-pill__soon", el)?.remove();
      });
    });
  }

  /* -----------------------------------------------------------------------
     Disabled contact actions
     ----------------------------------------------------------------------- */

  function initDisabledActions() {
    $$('[data-disabled-action]').forEach((el) => {
      el.addEventListener("click", (event) => {
        event.preventDefault();
        const message = el.dataset.disabledAction || "سيتم تفعيل هذه القناة عند اعتماد بيانات التواصل الرسمية.";
        toast(message);
      });
    });
  }

  /* -----------------------------------------------------------------------
     Work lightbox
     ----------------------------------------------------------------------- */

  function initLightbox() {
    const cards = $$("[data-work-card]");
    if (!cards.length) return;
    if ($(".lightbox")) return;

    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.id = "work-lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.setAttribute("aria-labelledby", "lightbox-title");
    lightbox.innerHTML = `
      <div class="lightbox__dialog">
        <button class="lightbox__close" type="button" aria-label="إغلاق معاينة العمل">
          <svg class="icon" aria-hidden="true"><use href="#i-close"></use></svg>
        </button>
        <div class="lightbox__visual"></div>
        <div class="lightbox__body">
          <span class="work-card__cat" data-lightbox-cat></span>
          <h3 id="lightbox-title" data-lightbox-title></h3>
          <p data-lightbox-desc></p>
          <div class="lightbox__meta" data-lightbox-meta></div>
          <a class="btn btn--primary" href="request.html" data-lightbox-cta>
            اطلب عملًا مشابهًا
            <svg class="icon icon--arrow" aria-hidden="true"><use href="#i-arrow"></use></svg>
          </a>
        </div>
      </div>`;
    document.body.append(lightbox);

    let trigger = null;
    const close = () => {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-locked");
      if (trigger) trigger.focus();
    };

    const open = (card) => {
      trigger = card;
      const visual = $(".work-card__visual", card);
      const visualTarget = $(".lightbox__visual", lightbox);
      visualTarget.innerHTML = "";
      if (visual) {
        const clone = visual.cloneNode(true);
        $$("[data-work-card]", clone).forEach((el) => el.removeAttribute("data-work-card"));
        visualTarget.append(clone);
      }
      $("[data-lightbox-cat]", lightbox).textContent = card.dataset.cat || "";
      $("[data-lightbox-title]", lightbox).textContent = card.dataset.title || "";
      $("[data-lightbox-desc]", lightbox).textContent = card.dataset.desc || "";
      const meta = $("[data-lightbox-meta]", lightbox);
      meta.innerHTML = "";
      (card.dataset.tags || "").split("|").filter(Boolean).forEach((tag) => {
        const span = document.createElement("span");
        span.textContent = tag;
        meta.append(span);
      });
      $("[data-lightbox-cta]", lightbox).href = card.dataset.cta || "request.html";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-locked");
      $(".lightbox__close", lightbox).focus();
    };

    document.addEventListener("click", (event) => {
      const card = event.target.closest("[data-work-card]");
      if (card) open(card);
    });

    $(".lightbox__close", lightbox).addEventListener("click", close);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) close();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && lightbox.classList.contains("is-open")) close();
    });
  }

  /* -----------------------------------------------------------------------
     Dynamic content added from the local dashboard
     ----------------------------------------------------------------------- */

  function customServiceCard(service) {
    const id = escapeHtml(service.id);
    const title = escapeHtml(service.title);
    const category = service.category === "university" ? "university" : "school";
    const categoryLabel = category === "university" ? "جامعي" : "مدرسي";
    const desc = escapeHtml(service.description);
    return `
      <article class="service-card" data-category="${category}">
        <div class="service-card__visual" style="--tone: var(--violet-100); --accent: var(--violet-700);">
          <span class="service-card__icon">
            <svg class="icon" aria-hidden="true"><use href="#i-sparkle"></use></svg>
          </span>
          <span class="service-card__tag">${categoryLabel}</span>
          <div class="service-card__art" aria-hidden="true"></div>
        </div>
        <div class="service-card__body">
          <h3>${title}</h3>
          <p>${desc}</p>
          <div class="service-card__foot">
            <span class="service-card__meta">
              <svg class="icon" aria-hidden="true"><use href="#i-sparkle"></use></svg>
              خدمة مضافة
            </span>
            <a class="service-card__link" href="request.html?service=custom-${encodeURIComponent(service.id)}">
              اطلب الخدمة
              <svg class="icon" aria-hidden="true"><use href="#i-arrow"></use></svg>
            </a>
          </div>
        </div>
      </article>`;
  }

  function customWorkCard(work) {
    const id = escapeHtml(work.id);
    const title = escapeHtml(work.title);
    const category = escapeHtml(work.category || "project");
    const catLabel = escapeHtml(work.categoryLabel || "عمل مضاف");
    const description = escapeHtml(work.description);
    const tags = escapeHtml(work.tags || "تصميم|إخراج");
    const cta = `request.html?service=custom-work`;
    return `
      <article class="work-card" data-work-card data-category="${category}" data-title="${title}" data-cat="${catLabel}" data-desc="${description}" data-tags="${tags}" data-cta="${cta}">
        <div class="work-card__visual" style="--art-bg:#eeeafb">
          <span class="work-card__badge">عمل مضاف من لوحة التحكم</span>
          <div class="mockup mockup--summary">
            <span class="mockup__label">EDUVIA · WORK</span>
            <div class="mockup__notebook">
              <h4>${title}</h4>
              <span class="mockup__highlight">${catLabel}</span>
              <div class="mockup__lines"><i></i><i></i><i></i></div>
            </div>
          </div>
        </div>
        <div class="work-card__body">
          <span class="work-card__cat">${catLabel}</span>
          <h3>${title}</h3>
          <p>${description}</p>
        </div>
        <button class="work-card__open" type="button" aria-label="معاينة ${title}"></button>
      </article>`;
  }

  function initCustomContent() {
    const servicesTarget = $("[data-custom-services]");
    if (servicesTarget) {
      readStore(STORAGE.services).forEach((service) => {
        servicesTarget.insertAdjacentHTML("beforeend", customServiceCard(service));
      });
      servicesTarget.dispatchEvent(new CustomEvent("eduvia:content-updated", { bubbles: true }));
    }

    const worksTarget = $("[data-custom-works]");
    if (worksTarget) {
      readStore(STORAGE.portfolio).forEach((work) => {
        worksTarget.insertAdjacentHTML("beforeend", customWorkCard(work));
      });
      worksTarget.dispatchEvent(new CustomEvent("eduvia:content-updated", { bubbles: true }));
    }
  }

  /* -----------------------------------------------------------------------
     Contact form
     ----------------------------------------------------------------------- */

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
  }

  function setError(field, message) {
    const group = field.closest(".form-group");
    if (!group) return;
    field.setAttribute("aria-invalid", "true");
    let error = $(".field-error", group);
    if (!error) {
      error = document.createElement("span");
      error.className = "field-error";
      error.setAttribute("role", "alert");
      group.append(error);
    }
    error.textContent = message;
  }

  function clearError(field) {
    field.removeAttribute("aria-invalid");
    const group = field.closest(".form-group");
    $(".field-error", group)?.remove();
  }

  function initContactForm() {
    const form = $("#contact-form");
    if (!form) return;

    const success = $("#contact-success");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      let valid = true;
      const fields = {
        name: $("#contact-name", form),
        email: $("#contact-email", form),
        subject: $("#contact-subject", form),
        message: $("#contact-message", form)
      };

      Object.values(fields).forEach((field) => {
        field.value = field.value.trim();
        clearError(field);
      });

      if (fields.name.value.length < 2) {
        setError(fields.name, "يرجى كتابة الاسم الكامل.");
        valid = false;
      }
      if (!validateEmail(fields.email.value)) {
        setError(fields.email, "يرجى إدخال بريد إلكتروني صحيح.");
        valid = false;
      }
      if (fields.subject.value.length < 3) {
        setError(fields.subject, "يرجى كتابة موضوع الرسالة.");
        valid = false;
      }
      if (fields.message.value.length < 10) {
        setError(fields.message, "اكتب رسالة من 10 أحرف على الأقل.");
        valid = false;
      }

      if (!valid) {
        $("[aria-invalid='true']", form)?.focus();
        return;
      }

      const messages = readStore(STORAGE.messages);
      messages.unshift({
        id: `MSG-${Date.now()}`,
        name: fields.name.value,
        email: fields.email.value,
        subject: fields.subject.value,
        message: fields.message.value,
        createdAt: new Date().toISOString(),
        read: false
      });
      if (!writeStore(STORAGE.messages, messages)) return;

      form.hidden = true;
      if (success) {
        success.hidden = false;
        success.focus?.();
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      toast("تم حفظ رسالتك بنجاح. ستظهر في لوحة إدارة إيدوفيا.");
    });
  }

  /* -----------------------------------------------------------------------
     Boot
     ----------------------------------------------------------------------- */

  document.addEventListener("DOMContentLoaded", () => {
    injectIcons();
    initHeader();
    initReveal();
    initFilters();
    initTabs();
    initVideo();
    initSiteSettings();
    initDisabledActions();
    initContactForm();
    initCustomContent();
    initLightbox();

    $$("[data-current-year]").forEach((el) => {
      el.textContent = new Date().getFullYear();
    });

    const hash = window.location.hash;
    if (hash) {
      const target = document.querySelector(hash);
      if (target) setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
  });

  window.EDUVIA = {
    storage: STORAGE,
    readStore,
    writeStore,
    escapeHtml,
    toast,
    setError,
    clearError,
    validateEmail
  };
})();
