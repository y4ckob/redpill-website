/* =========================================================
   RedPill Audio — shared behaviour
   ========================================================= */
(function () {
  "use strict";

  /* ---- where enquiries are sent ----
     Default: opens a pre-filled email to the address below.
     To capture enquiries server-side instead (e.g. a Google Apps
     Script webhook like the F'n'B RSVP queue), set ENQUIRY_WEBHOOK
     to the webhook URL and the form will POST JSON to it.            */
  var ENQUIRY_EMAIL = "contact@redpillaudio.com";
  var ENQUIRY_WEBHOOK = ""; // e.g. "https://script.google.com/macros/s/XXXX/exec"

  var STORE_KEY = "rpa_enquiry_v1";

  /* ---------- drawer mode: "product" (basket) or "project" (full install) ---------- */
  var mode = "product";
  function setMode(m) {
    mode = m === "project" ? "project" : "product";
    var d = document.getElementById("drawer");
    if (!d) return;
    d.classList.toggle("drawer--project", mode === "project");
    document.querySelectorAll(".drawer__tab").forEach(function (t) {
      t.classList.toggle("active", t.getAttribute("data-mode") === mode);
    });
    var title = document.getElementById("drawerTitle");
    if (title) title.textContent = mode === "project" ? "Project enquiry" : "Your enquiry";
    var submitBtn = document.getElementById("requestQuote");
    if (submitBtn) submitBtn.textContent = mode === "project" ? "Send project enquiry" : "Request quotation";
    renderProjectNote();
  }
  function renderProjectNote() {
    var n = document.getElementById("projectItemsNote");
    if (!n) return;
    var q = totalQty();
    n.textContent = (q > 0)
      ? "You also have " + q + (q === 1 ? " item" : " items") + " in your product enquiry. It is kept separately; switch to Products to review or send it."
      : "";
  }

  /* ---------- storage (degrades gracefully) ---------- */
  var mem = [];
  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      mem = raw ? JSON.parse(raw) : [];
    } catch (e) { /* preview / private mode */ }
    return mem;
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(mem)); } catch (e) {}
  }

  /* ---------- basket ops ---------- */
  function find(id) { return mem.find(function (i) { return i.id === id; }); }
  function totalQty() { return mem.reduce(function (s, i) { return s + i.qty; }, 0); }
  function totalPrice() {
    return mem.reduce(function (s, i) {
      return s + (typeof i.price === "number" ? i.price * i.qty : 0);
    }, 0);
  }
  function hasAnyPrice() {
    return mem.some(function (i) { return typeof i.price === "number"; });
  }

  function add(id, name, cat, price, unit) {
    var item = find(id);
    if (item) {
      item.qty += 1;
      // Refresh price/unit from latest catalogue data
      item.price = (typeof price === "number") ? price : item.price;
      item.unit = unit || item.unit || "";
    } else {
      mem.push({ id: id, name: name, cat: cat || "", price: (typeof price === "number") ? price : null, unit: unit || "", qty: 1 });
    }
    save(); render(); toast(name + " added to enquiry");
    setMode("product");
  }
  function setQty(id, q) {
    var item = find(id);
    if (!item) return;
    item.qty = q;
    if (item.qty <= 0) mem = mem.filter(function (i) { return i.id !== id; });
    save(); render();
  }
  function remove(id) {
    mem = mem.filter(function (i) { return i.id !== id; });
    save(); render();
  }

  /* ---------- count badges + button states ---------- */
  var prevCount = null;
  function render() {
    var n = totalQty();
    document.querySelectorAll(".cart-count").forEach(function (el) {
      el.textContent = n;
      el.classList.toggle("empty", n === 0);
      // soft pulse when the count goes up (skip initial page render)
      if (prevCount !== null && n > prevCount) {
        el.classList.remove("bump");
        void el.offsetWidth; // restart the animation
        el.classList.add("bump");
      }
    });
    prevCount = n;
    // reflect added state on shop buttons; priced items swap the button for
    // an inline quantity stepper on the card (kept in sync with the drawer,
    // since both read the same basket and re-render together)
    document.querySelectorAll(".add-btn[data-id]").forEach(function (btn) {
      var id = btn.getAttribute("data-id");
      var item = find(id);
      btn.classList.toggle("added", !!item);
      var label = btn.querySelector(".add-label");
      var enquireMode = btn.classList.contains("add-btn--enquire");
      if (label) label.textContent = item ? "In enquiry" : (enquireMode ? "Enquire" : "Add to enquiry");

      var next = btn.nextElementSibling;
      var stepper = (next && next.classList && next.classList.contains("card-qty")) ? next : null;
      var wantsStepper = item && !enquireMode && typeof item.price === "number";
      if (wantsStepper) {
        if (!stepper) {
          stepper = document.createElement("div");
          stepper.className = "qty card-qty";
          stepper.innerHTML =
            '<button type="button" data-act="dec" data-id="' + id + '" aria-label="Decrease quantity">&minus;</button>' +
            "<span></span>" +
            '<button type="button" data-act="inc" data-id="' + id + '" aria-label="Increase quantity">+</button>';
          btn.parentNode.insertBefore(stepper, btn.nextSibling);
        }
        stepper.querySelector("span").textContent = item.qty;
        btn.classList.add("add-btn--swapped");
      } else {
        if (stepper) stepper.remove();
        btn.classList.remove("add-btn--swapped");
      }
    });
    renderDrawer();
  }

  /* ---------- drawer ---------- */
  function renderDrawer() {
    var body = document.getElementById("drawerBody");
    if (!body) return;
    if (!mem.length) {
      body.innerHTML =
        '<div class="drawer__empty">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h2.2l2.3 12.4a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.1L21.5 7H6"/></svg>' +
        "Your enquiry list is empty.<br>Browse the catalogue and add items of interest.</div>";
      renderTotal();
      renderProjectNote();
      return;
    }
    var html = "";
    mem.forEach(function (i) {
      var priceLine;
      if (typeof i.price === "number") {
        priceLine =
          '<div class="li-price">' +
            '<span class="from">From</span>' +
            "IDR " + fmtIDR(i.price * i.qty) +
            (i.unit ? '<span class="unit">· ' + esc(i.unit) + "</span>" : "") +
          "</div>";
      } else {
        priceLine = '<div class="li-price poa">Price on application</div>';
      }
      var qtyBlock;
      if (typeof i.price === "number") {
        qtyBlock =
          '<div class="qty">' +
            '<button data-act="dec" data-id="' + i.id + '" aria-label="Decrease">&minus;</button>' +
            "<span>" + i.qty + "</span>" +
            '<button data-act="inc" data-id="' + i.id + '" aria-label="Increase">+</button>' +
          "</div>";
      } else {
        qtyBlock = '<div class="qty qty--single">Information request</div>';
      }
      html +=
        '<div class="line-item">' +
          '<div class="li-info">' +
            "<h4>" + esc(i.name) + "</h4>" +
            (i.cat ? '<div class="li-cat">' + esc(i.cat) + "</div>" : "") +
            priceLine +
            qtyBlock +
          "</div>" +
          '<button class="li-remove" data-act="rm" data-id="' + i.id + '" aria-label="Remove">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
          "</button>" +
        "</div>";
    });
    body.innerHTML = html;
    renderTotal();
    renderProjectNote();
  }

  function renderTotal() {
    var foot = document.querySelector(".drawer__foot");
    if (!foot) return;
    var existing = foot.querySelector(".drawer__total");
    if (existing) existing.remove();
    if (!hasAnyPrice() || !mem.length) return;
    var t = totalPrice();
    var el = document.createElement("div");
    el.className = "drawer__total";
    el.innerHTML =
      '<div>' +
        '<span class="label">Indicative total</span>' +
        '<span class="hint">Starting prices, before installation. Final quotation on application.</span>' +
      '</div>' +
      '<span class="value">IDR ' + fmtIDR(t) + '</span>';
    foot.insertBefore(el, foot.firstChild);
  }

  function fmtIDR(n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- request quotation ---------- */
  function buildSummary() {
    var lines = mem.map(function (i) {
      var line = "- " + i.name + (i.cat ? " (" + i.cat + ")" : "") + " x " + i.qty;
      if (typeof i.price === "number") {
        line += "  [from IDR " + fmtIDR(i.price * i.qty) +
          (i.unit ? " " + i.unit : "") + "]";
      }
      return line;
    });
    if (hasAnyPrice()) {
      lines.push("");
      lines.push("Indicative total: IDR " + fmtIDR(totalPrice()) +
        " (starting prices, before installation; final quotation on application)");
    }
    return lines.join("\n");
  }

  function submitEnquiry(formData) {
    if (mode !== "project" && !mem.length) { toast("Add items before requesting a quote"); return; }

    var payload = {
      type: mode === "project" ? "project" : "product",
      email: formData.email,
      whatsapp: formData.whatsapp,
      location: formData.location,
      indonesia: !!formData.indonesia,
      ts: new Date().toISOString()
    };
    if (mode === "project") {
      payload.message = formData.message || "";
    } else {
      payload.items = mem;
    }

    if (ENQUIRY_WEBHOOK) {
      // text/plain avoids a CORS preflight that Apps Script does not answer
      fetch(ENQUIRY_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.text().then(function (t) { return { ok: res.ok, body: t }; }); })
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.body);
          toast("Enquiry sent. We will be in touch.");
          if (mode === "project") {
            var msgEl = document.getElementById("enq-message");
            if (msgEl) msgEl.value = "";
          } else {
            mem = []; save(); render();
          }
          setTimeout(closeDrawer, 1200);
        })
        .catch(function () { mailtoQuote(formData); });
      return;
    }
    mailtoQuote(formData);
  }

  function mailtoQuote(formData) {
    var subject, body;
    if (mode === "project") {
      subject = "RedPill Audio project enquiry";
      body =
        "Hello RedPill Audio,\n\nI'd like to talk about a project.\n\n" +
        (formData.message ? "About the space:\n" + formData.message + "\n\n" : "") +
        "Email: " + (formData.email || "") +
        "\nWhatsApp: " + (formData.whatsapp || "") +
        "\nLocation: " + (formData.location || "") +
        "\n\nThank you.";
    } else {
      subject = "Quotation request — RedPill Audio";
      body =
        "Hello RedPill Audio,\n\nI'd like a quotation for the following:\n\n" +
        buildSummary() +
        "\n\nEmail: " + (formData.email || "") +
        "\nWhatsApp: " + (formData.whatsapp || "") +
        "\nLocation: " + (formData.location || "") +
        "\n\nThank you.";
    }
    window.location.href =
      "mailto:" + ENQUIRY_EMAIL +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
  }

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(msg) {
    var t = document.getElementById("toast");
    if (!t) return;
    t.querySelector(".toast-msg").textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }

  /* ---------- drawer open/close ---------- */
  function openDrawer() {
    var d = document.getElementById("drawer"),
        o = document.getElementById("drawerOverlay");
    if (d) d.classList.add("open");
    if (o) o.classList.add("open");
  }
  function closeDrawer() {
    var d = document.getElementById("drawer"),
        o = document.getElementById("drawerOverlay");
    if (d) d.classList.remove("open");
    if (o) o.classList.remove("open");
  }

  /* ---------- wire up ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    load();
    render();

    // nav scroll state: solid background after 30px, and hide on scroll
    // down / show on scroll up (always visible near the top)
    var nav = document.querySelector(".nav");
    var lastY = window.scrollY;
    function onScroll() {
      if (!nav) return;
      var y = window.scrollY;
      nav.classList.toggle("scrolled", y > 30);
      if (nav.classList.contains("mobile-open")) { lastY = y; return; }
      if (y <= 10) {
        nav.classList.remove("nav--hidden");
      } else if (y > lastY + 4) {
        nav.classList.add("nav--hidden");
      } else if (y < lastY - 4) {
        nav.classList.remove("nav--hidden");
      }
      lastY = y;
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // mobile menu
    var toggle = document.querySelector(".nav-toggle");
    if (toggle && nav) toggle.addEventListener("click", function () { nav.classList.toggle("mobile-open"); });
    // Close the mobile menu when any link/action inside it is tapped. Same-page
    // anchors (#showroom, #contact) don't reload the page, so without this the
    // dropdown stays open over the section. The menu uses display:none/flex (no
    // body scroll-lock), so it closes instantly before the anchor scroll; the
    // section's scroll-margin-top offset is unaffected. No-op on desktop (no
    // .mobile-open set) and harmless on cross-page links (the page reloads).
    if (nav) {
      nav.querySelectorAll(".nav-links a, .nav-links .cart-btn").forEach(function (el) {
        el.addEventListener("click", function () { nav.classList.remove("mobile-open"); });
      });
    }

    // MOBILE: land showroom links so the "Visit the Showroom" CTA button sits
    // at the bottom of the viewport (block:end anchors the BUTTON's bottom, not
    // the section's — the button is the unambiguous visible end of the content,
    // and the heading/text/video fill upward above it). The gap below the
    // button is the button's scroll-margin-bottom (CSS) = a small inset + the
    // home-bar safe-area, so it's fully visible and clear of the home indicator.
    // Desktop keeps its CSS flush-to-top anchor (early return below). Same-page
    // links are intercepted; cross-page arrivals (index.html#showroom) handled
    // by the on-load hash check. Guarded.
    var showroomBtn = document.querySelector("#showroom .btn--red");
    if (showroomBtn) {
      var showroomMQ = window.matchMedia("(max-width: 760px)");
      var landOnShowroom = function (smooth) {
        showroomBtn.scrollIntoView({ block: "end", behavior: smooth ? "smooth" : "auto" });
      };
      document.querySelectorAll('a[href="#showroom"]').forEach(function (link) {
        link.addEventListener("click", function (e) {
          if (!showroomMQ.matches) return;   // desktop: default CSS anchor (flush to top)
          e.preventDefault();
          if (history.replaceState) history.replaceState(null, "", "#showroom");
          landOnShowroom(true);
        });
      });
      if (location.hash === "#showroom" && showroomMQ.matches) {
        requestAnimationFrame(function () { landOnShowroom(false); });
      }
    }

    // delegate clicks
    document.addEventListener("click", function (e) {
      var toggleBtn = e.target.closest(".card__toggle");
      if (toggleBtn) {
        var card = toggleBtn.closest(".card");
        var open = card.classList.toggle("card--open");
        toggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
        var lbl = toggleBtn.querySelector(".toggle-label");
        if (lbl) lbl.textContent = open ? "Hide details" : "View details";
        syncRowHeights(card.parentElement);
        return;
      }
      var addBtn = e.target.closest(".add-btn[data-id]");
      if (addBtn) {
        var btnId = addBtn.getAttribute("data-id");
        // already in the enquiry: the same button removes it again
        if (find(btnId)) {
          remove(btnId);
          toast(addBtn.getAttribute("data-name") + " removed from enquiry");
          return;
        }
        var rawPrice = addBtn.getAttribute("data-price");
        var price = rawPrice ? parseInt(rawPrice, 10) : null;
        add(
          btnId,
          addBtn.getAttribute("data-name"),
          addBtn.getAttribute("data-cat"),
          isNaN(price) ? null : price,
          addBtn.getAttribute("data-unit") || ""
        );
        return;
      }
      if (e.target.closest("[data-open-project]")) { setMode("project"); openDrawer(); return; }
      if (e.target.closest("[data-open-cart]")) { setMode("product"); openDrawer(); return; }
      if (e.target.closest("[data-close-cart]")) { closeDrawer(); return; }

      var tab = e.target.closest(".drawer__tab[data-mode]");
      if (tab) { setMode(tab.getAttribute("data-mode")); return; }

      var act = e.target.closest("[data-act]");
      if (act) {
        var id = act.getAttribute("data-id");
        var a = act.getAttribute("data-act");
        var item = find(id);
        if (a === "inc") setQty(id, (item ? item.qty : 0) + 1);
        if (a === "dec") setQty(id, (item ? item.qty : 0) - 1);
        if (a === "rm") remove(id);
      }
    });

    // in-drawer enquiry form
    var enquiryForm = document.getElementById("enquiryForm");
    if (enquiryForm) {
      var indCheck = document.getElementById("enq-indonesia");
      var submitBtn = document.getElementById("requestQuote");
      function refreshSubmit() {
        submitBtn.disabled = !(indCheck && indCheck.checked);
      }
      if (indCheck) indCheck.addEventListener("change", refreshSubmit);
      refreshSubmit();

      enquiryForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!indCheck.checked) { toast("Please confirm Indonesia delivery"); return; }
        var emailEl = document.getElementById("enq-email");
        var locEl = document.getElementById("enq-location");
        if (!emailEl.value || !locEl.value) {
          toast("Please add email and location");
          return;
        }
        submitBtn.disabled = true;
        var originalLabel = submitBtn.textContent;
        submitBtn.textContent = "Sending…";
        submitEnquiry({
          email: emailEl.value.trim(),
          whatsapp: (document.getElementById("enq-whatsapp") || {}).value || "",
          location: locEl.value.trim(),
          indonesia: indCheck.checked,
          message: ((document.getElementById("enq-message") || {}).value || "").trim()
        });
        // Re-enable in case of failure / fallback
        setTimeout(function () {
          submitBtn.textContent = originalLabel;
          refreshSubmit();
        }, 2500);
      });
    }

    // contact form (front-end only; opens email)
    var cf = document.getElementById("contactForm");
    if (cf) {
      cf.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = (document.getElementById("cName") || {}).value || "";
        var email = (document.getElementById("cEmail") || {}).value || "";
        var msg = (document.getElementById("cMsg") || {}).value || "";
        var body = "Name: " + name + "\nEmail: " + email + "\n\n" + msg;
        window.location.href = "mailto:" + ENQUIRY_EMAIL +
          "?subject=" + encodeURIComponent("Website enquiry — " + name) +
          "&body=" + encodeURIComponent(body);
      });
    }

    // ?expand=<product-id> opens a shop card on load (used for previews)
    var expandId = (location.search.match(/[?&]expand=([^&]+)/) || [])[1];
    if (expandId) {
      var btn = document.querySelector('.add-btn[data-id="' + expandId + '"]');
      var card = btn && btn.closest(".card");
      if (card) {
        card.classList.add("card--open");
        var t = card.querySelector(".card__toggle");
        if (t) { t.setAttribute("aria-expanded", "true"); var lbl = t.querySelector(".toggle-label"); if (lbl) lbl.textContent = "Hide details"; }
      }
    }

    // gallery lightbox (gallery.html only; no-ops elsewhere)
    var lightbox = document.getElementById("lightbox");
    if (lightbox) {
      var lbItems = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
      var lbImg = lightbox.querySelector(".lightbox__img");
      var lbIndex = 0;

      function lbShow(i) {
        lbIndex = (i + lbItems.length) % lbItems.length;
        lbImg.src = lbItems[lbIndex].getAttribute("href");
        // preload neighbours so arrows/swipe feel instant
        [lbIndex + 1, lbIndex - 1].forEach(function (n) {
          var pre = new Image();
          pre.src = lbItems[(n + lbItems.length) % lbItems.length].getAttribute("href");
        });
      }
      function lbOpen(i) {
        lbShow(i);
        lightbox.classList.add("open");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      }
      function lbClose() {
        lightbox.classList.remove("open");
        lightbox.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        lbImg.src = "";
      }

      lbItems.forEach(function (item, i) {
        item.addEventListener("click", function (e) {
          e.preventDefault();
          lbOpen(i);
        });
      });
      lightbox.querySelector(".lightbox__close").addEventListener("click", lbClose);
      lightbox.querySelector(".lightbox__prev").addEventListener("click", function () { lbShow(lbIndex - 1); });
      lightbox.querySelector(".lightbox__next").addEventListener("click", function () { lbShow(lbIndex + 1); });
      // click on the backdrop (not the image or buttons) closes
      lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox) lbClose();
      });
      document.addEventListener("keydown", function (e) {
        if (!lightbox.classList.contains("open")) return;
        if (e.key === "Escape") lbClose();
        if (e.key === "ArrowLeft") lbShow(lbIndex - 1);
        if (e.key === "ArrowRight") lbShow(lbIndex + 1);
      });
      // swipe between images
      var touchX = null;
      lightbox.addEventListener("touchstart", function (e) {
        if (e.touches.length === 1) touchX = e.touches[0].clientX;
      }, { passive: true });
      lightbox.addEventListener("touchend", function (e) {
        if (touchX === null) return;
        var dx = e.changedTouches[0].clientX - touchX;
        touchX = null;
        if (Math.abs(dx) > 40) lbShow(lbIndex + (dx < 0 ? 1 : -1));
      }, { passive: true });
    }

    // rows stay equal-height at rest; while a card is expanded its row
    // neighbours get align-self:start so they keep their natural height
    // (same offsetTop = same grid row)
    function syncRowHeights(grid) {
      if (!grid || !grid.classList.contains("shop-grid")) return;
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".card"));
      cards.forEach(function (c) { c.classList.remove("card--natural"); });
      cards.forEach(function (oc) {
        if (!oc.classList.contains("card--open")) return;
        cards.forEach(function (c) {
          if (c !== oc && !c.classList.contains("card--open") && Math.abs(c.offsetTop - oc.offsetTop) < 2) {
            c.classList.add("card--natural");
          }
        });
      });
    }

    // in-place card image galleries: dots + arrows appear only when a
    // product genuinely has more than one image (missing gallery files
    // remove themselves, so the count settles after load)
    document.querySelectorAll(".card__media .media-track").forEach(function (track) {
      var media = track.closest(".card__media");

      function imgs() { return track.querySelectorAll("img"); }
      function index() { return Math.round(track.scrollLeft / Math.max(1, track.clientWidth)); }
      function goTo(i) {
        var n = imgs().length;
        i = Math.max(0, Math.min(i, n - 1));
        track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
      }
      function updateDots() {
        var dots = media.querySelectorAll(".media-dots button");
        var cur = index();
        dots.forEach(function (d, i) { d.classList.toggle("active", i === cur); });
      }
      function build() {
        media.querySelectorAll(".media-dots, .media-nav").forEach(function (el) { el.remove(); });
        var n = imgs().length;
        if (n < 2) return;
        var dots = document.createElement("div");
        dots.className = "media-dots";
        for (var i = 0; i < n; i++) {
          (function (i) {
            var b = document.createElement("button");
            b.type = "button";
            b.setAttribute("aria-label", "Image " + (i + 1) + " of " + n);
            b.addEventListener("click", function () { goTo(i); });
            dots.appendChild(b);
          })(i);
        }
        media.appendChild(dots);
        [["prev", -1, "m15 18-6-6 6-6"], ["next", 1, "m9 6 6 6-6 6"]].forEach(function (def) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "media-nav media-nav--" + def[0];
          b.setAttribute("aria-label", def[0] === "prev" ? "Previous image" : "Next image");
          b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="' + def[2] + '"/></svg>';
          b.addEventListener("click", function () { goTo(index() + def[1]); });
          media.appendChild(b);
        });
        updateDots();
      }

      var scrollTick = false;
      track.addEventListener("scroll", function () {
        if (scrollTick) return;
        scrollTick = true;
        requestAnimationFrame(function () { scrollTick = false; updateDots(); });
      }, { passive: true });
      // a missing gallery file removes its <img>; rebuild once it's gone
      track.addEventListener("error", function () { setTimeout(build, 0); }, true);
      build();
    });

    // mobile accordions: Environments + How we work share this. JS only
    // toggles the .is-open class (never inline styles); all collapse styling
    // is CSS inside the max-width:760px query, so it has no visual effect on
    // desktop. aria-expanded is synced to the ACTUAL state per viewport using
    // the same 760px breakpoint as the CSS: collapsed/open at mobile, always
    // open (true) on desktop where every panel is visible. Sections absent on
    // a page -> initAccordion returns null and is filtered out (no-op).
    var accMQ = window.matchMedia("(max-width: 760px)");
    function initAccordion(container, itemSel, toggleSel, openFirst) {
      if (openFirst === undefined) openFirst = true;
      if (!container) return null;
      var items = Array.prototype.slice.call(container.querySelectorAll(itemSel));
      var toggles = Array.prototype.slice.call(container.querySelectorAll(toggleSel));
      if (!toggles.length) return null;
      function syncAria() {
        items.forEach(function (item) {
          var t = item.querySelector(toggleSel);
          if (!t) return;
          var open = accMQ.matches ? item.classList.contains("is-open") : true;
          t.setAttribute("aria-expanded", open ? "true" : "false");
        });
      }
      // single-open; first item open on load only when openFirst (else all closed)
      items.forEach(function (item, i) { item.classList.toggle("is-open", openFirst && i === 0); });
      toggles.forEach(function (t) {
        t.addEventListener("click", function () {
          var item = t.closest(itemSel);
          var wasOpen = item.classList.contains("is-open");
          items.forEach(function (e) { e.classList.remove("is-open"); });
          if (!wasOpen) item.classList.add("is-open");
          syncAria();
        });
      });
      syncAria();
      return syncAria;
    }
    var accSyncs = [
      initAccordion(document.querySelector(".environments"), ".env", ".env__toggle", true),
      initAccordion(document.querySelector(".features"), ".feature", ".feature__toggle", false)
    ].filter(Boolean);
    if (accSyncs.length) {
      var onAccMQ = function () { accSyncs.forEach(function (fn) { fn(); }); };
      if (accMQ.addEventListener) accMQ.addEventListener("change", onAccMQ);
      else if (accMQ.addListener) accMQ.addListener(onAccMQ); // older Safari
    }

    // mobile swipe carousels: pagination dots that track the active card.
    // Track + dots are absent on pages without them, so each call no-ops
    // silently. Dots stay hidden on desktop via CSS; the observer just keeps
    // the active dot in sync as the user swipes.
    function initSwipeDots(track, dots, slideSel, label) {
      if (!track || !dots) return;
      var slides = Array.prototype.slice.call(track.querySelectorAll(slideSel));
      if (slides.length < 2) return;
      slides.forEach(function (slide, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Go to " + label + " " + (i + 1));
        b.addEventListener("click", function () {
          track.scrollTo({ left: slides[i].offsetLeft - slides[0].offsetLeft, behavior: "smooth" });
        });
        dots.appendChild(b);
      });
      var dotEls = Array.prototype.slice.call(dots.children);
      function setActiveDot(i) {
        dotEls.forEach(function (d, n) { d.classList.toggle("active", n === i); });
      }
      setActiveDot(0);
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) setActiveDot(slides.indexOf(en.target));
          });
        }, { root: track, threshold: 0.6 });
        slides.forEach(function (s) { io.observe(s); });
      }
    }
    initSwipeDots(document.querySelector(".quotes"), document.querySelector(".quotes-dots"), ".quote", "testimonial");
    initSwipeDots(document.querySelector(".feat-prod"), document.querySelector(".feat-dots"), ".card", "product");

    // lazy-load the showroom footage: it only fetches and plays once the
    // user scrolls near it, keeping the top of the page fast
    var lazyVid = document.querySelector("video[data-lazy-video]");
    if (lazyVid) {
      var startVideo = function () {
        lazyVid.querySelectorAll("source[data-src]").forEach(function (s) {
          s.src = s.getAttribute("data-src");
          s.removeAttribute("data-src");
        });
        lazyVid.load();
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          var p = lazyVid.play();
          if (p && p.catch) p.catch(function () {});
        }
      };
      if ("IntersectionObserver" in window) {
        var vio = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            startVideo();
            vio.unobserve(lazyVid);
          });
        }, { rootMargin: "600px 0px" });
        vio.observe(lazyVid);
      } else {
        startVideo();
      }
    }

    // reveal on scroll; elements entering in the same frame stagger gently
    var io = new IntersectionObserver(function (entries) {
      var batch = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.style.transitionDelay = Math.min(batch * 90, 270) + "ms";
        el.classList.add("in");
        // clear the stagger once revealed so it never delays hover transitions
        el.addEventListener("transitionend", function () { el.style.transitionDelay = ""; }, { once: true });
        io.unobserve(el);
        batch++;
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

    // shop product cards: reveal as they scroll into view (mobile pilot).
    // The class is added HERE, so if JS doesn't run the cards stay visible
    // (no-JS safe); the hide/reveal styling is CSS, scoped to .shop-grid +
    // mobile, so desktop and other sections are unaffected. A generous
    // bottom rootMargin pre-reveals each card before it enters the viewport,
    // so a fast scroll never waits on a blank card. Absent on other pages
    // (no .shop-grid) -> no-op. Separate observer; carousels untouched.
    var shopCards = document.querySelectorAll(".shop-grid .card");
    if (shopCards.length && "IntersectionObserver" in window) {
      var shopIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add("in");
          shopIO.unobserve(en.target);
        });
      }, { rootMargin: "0px 0px 25% 0px", threshold: 0 });
      shopCards.forEach(function (c) {
        c.classList.add("reveal-card");
        shopIO.observe(c);
      });
    }

    // gallery tiles: same per-tile reveal mechanism as the shop cards. Class
    // added here (no-JS safe); the hide/reveal CSS is desktop-only, so tiles
    // stay plain on mobile. The tile's hover zoom is on its inner <img>, so the
    // tile's reveal transform never clashes with it. No .gallery-item -> no-op.
    var galleryTiles = document.querySelectorAll(".gallery-item");
    if (galleryTiles.length && "IntersectionObserver" in window) {
      var galleryIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add("in");
          galleryIO.unobserve(en.target);
        });
      }, { rootMargin: "0px 0px 25% 0px", threshold: 0 });
      galleryTiles.forEach(function (t) {
        t.classList.add("reveal-card");
        galleryIO.observe(t);
      });
    }

    // desktop section-level reveal: each top-level content section eases in as
    // a block on first scroll-down, reveal-once. Same pattern as the shop
    // cards: the class is added HERE (no-JS safe -> sections visible without
    // JS), a bottom rootMargin pre-fires before the section enters so fast
    // scroll never waits, and we unobserve on reveal so it never re-animates.
    // The hide/reveal CSS is desktop-only, so this class is inert on mobile
    // (mobile keeps its existing reveals). Gated to the index page (.hero) so
    // shop/gallery are untouched; the hero itself is a <header>, not selected.
    if (document.querySelector(".hero") && "IntersectionObserver" in window) {
      var sections = document.querySelectorAll("body > section");
      if (sections.length) {
        var secIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            en.target.classList.add("in");
            secIO.unobserve(en.target);
          });
        }, { rootMargin: "0px 0px -10% 0px", threshold: 0 });
        sections.forEach(function (s) {
          s.classList.add("section-reveal");
          secIO.observe(s);
        });
      }
    }

    // fade images in as they finish loading (only ones not already loaded,
    // so cached pages and no-JS never hide anything)
    document.querySelectorAll(".card__media img, .gallery-item img").forEach(function (img) {
      if (img.complete) return;
      img.classList.add("will-fade");
      img.addEventListener("load", function () { img.classList.add("loaded"); }, { once: true });
      img.addEventListener("error", function () { img.classList.add("loaded"); }, { once: true });
    });
  });
})();
