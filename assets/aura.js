/* AURA — site behaviour. Progressive: everything readable without JS/GSAP. */
(() => {
  const WA = "971521576362";
  const html = document.documentElement;
  html.classList.add("js");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const waLink = (msg) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;

  /* ---------- WhatsApp links: <a data-wa="message"> ---------- */
  $$("[data-wa]").forEach((a) => {
    a.href = waLink(a.dataset.wa || "Hi Aura, I'd like to plan Christmas décor.");
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* ---------- Countdown to 25 December ---------- */
  const xmas = (() => {
    const n = new Date();
    let d = new Date(n.getFullYear(), 11, 25);
    if (n > new Date(n.getFullYear(), 11, 26)) d = new Date(n.getFullYear() + 1, 11, 25);
    return d;
  })();
  const tick = () => {
    const ms = Math.max(0, xmas - new Date());
    const d = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5), m = Math.floor((ms % 36e5) / 6e4);
    $$("[data-count=days]").forEach((e) => (e.textContent = d));
    $$("[data-count=hours]").forEach((e) => (e.textContent = String(h).padStart(2, "0")));
    $$("[data-count=mins]").forEach((e) => (e.textContent = String(m).padStart(2, "0")));
  };
  tick(); setInterval(tick, 30000);
  $$("[data-year]").forEach((e) => (e.textContent = xmas.getFullYear()));

  /* ---------- Curtain transition ---------- */
  const curtain = document.createElement("div");
  curtain.className = "curtain";
  curtain.setAttribute("aria-hidden", "true");
  curtain.innerHTML = '<svg class="curtain-mark" xmlns="http://www.w3.org/2000/svg" viewBox="-2 0 94.50 122.00" aria-hidden="true"><path d="M42.50 21.00 L45.30 21.00 L9.80 121.00 L7.00 121.00Z" fill="currentColor"/><path d="M42.50 21.00 L46.20 21.00 L80.00 121.00 L64.82 121.00Z" fill="currentColor"/><path d="M-0.50 121.00 L20.00 121.00 L20.00 118.90 L-0.50 118.90Z" fill="currentColor"/><path d="M58.00 121.00 L90.50 121.00 L90.50 118.90 L58.00 118.90Z" fill="currentColor"/><path d="M21.18 85.00 Q39.48 103.00 57.78 85.00" fill="none" stroke="currentColor" stroke-width="2.94" stroke-linecap="butt"/><path d="M43.95 2.20 L45.48 8.74 L49.44 10.28 L45.48 11.81 L43.95 23.20 L42.42 11.81 L38.46 10.28 L42.42 8.74 L43.95 2.20Z" fill="#C8A45E"/></svg><span class="curtain-name">Aura Event Management</span>';
  const canAnimate = !reduce && "animate" in curtain;
  const entering = html.classList.contains("is-entering");
  if (canAnimate) {
    if (entering) {
    document.body.appendChild(curtain);
    html.classList.remove("is-entering");
    curtain.animate([{ clipPath: "inset(0 0 0 0)" }, { clipPath: "inset(0 0 100% 0)" }],
      { duration: 900, delay: 250, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" });
    curtain.firstChild.animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }, { opacity: 0 }],
      { duration: 900, easing: "ease-out", fill: "forwards" });
    }
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname || /\.(?!html$)[a-z0-9]+$/i.test(url.pathname)) return;
      e.preventDefault();
      if (!curtain.isConnected) document.body.appendChild(curtain);
      try { sessionStorage.setItem("aura-nav", "1"); } catch (_) {}
      curtain.firstChild.style.opacity = 1;
      curtain.animate([{ clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
        { duration: 650, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" }).onfinish = () => (location.href = a.href);
    });
    addEventListener("pageshow", (e) => { if (e.persisted) curtain.getAnimations().forEach((a) => a.cancel()), (curtain.style.clipPath = "inset(0 0 100% 0)"); });
  }

  if (!canAnimate) html.classList.remove("is-entering");

  /* ---------- Header: solid after scroll, hides while reading down ---------- */
  const header = $(".site-header");
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    header?.classList.toggle("is-solid", y > 40);
    header?.classList.toggle("is-hidden", y > 400 && y > lastY + 4);
    if (y < lastY - 4) header?.classList.remove("is-hidden");
    lastY = y;
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- Off-screen video posters load when they come near ---------- */
  const pio = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (en.isIntersecting) { en.target.poster = en.target.dataset.poster; pio.unobserve(en.target); }
  }), { rootMargin: "600px 0px" });
  $$("video[data-poster]").forEach((v) => pio.observe(v));

  /* ---------- Videos play only while visible ---------- */
  const vio = new IntersectionObserver((ents) => ents.forEach((en) => {
    const v = en.target;
    if (en.isIntersecting && !reduce) v.play().catch(() => {}); else v.pause();
  }), { threshold: 0.15 });
  const startVideos = () => $$("video[data-auto]").forEach((v) => { v.muted = true; vio.observe(v); });
  // let the poster paint first (fast LCP), then bring the films to life
  if (document.readyState === "complete") setTimeout(startVideos, 300);
  else addEventListener("load", () => setTimeout(startVideos, 300), { once: true });

  /* ---------- Snowfall: three depth layers of soft flakes, a few gilt glints ---------- */
  const sc = $("#snow");
  const snowBtn = $(".snow-toggle");
  let snowOn = true;
  try { snowOn = localStorage.getItem("aura-snow") !== "off"; } catch (_) {}
  if (sc && !reduce) {
    const ctx = sc.getContext("2d");
    const mobile = matchMedia("(max-width: 899px)").matches;
    let W = 0, H = 0, dpr = 1, flakes = [], raf = 0, running = false, lastY = scrollY, drift = 0;
    // pre-render a soft flake sprite once (cheap to draw thousands of times)
    const sprite = (color, blur) => {
      const c = document.createElement("canvas"), s = 64; c.width = c.height = s;
      const g = c.getContext("2d"), grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      grd.addColorStop(0, color); grd.addColorStop(blur, color.replace(/[\d.]+\)$/, "0.55)")); grd.addColorStop(1, color.replace(/[\d.]+\)$/, "0)"));
      g.fillStyle = grd; g.fillRect(0, 0, s, s); return c;
    };
    const white = sprite("rgba(255,255,255,1)", 0.35), gold = sprite("rgba(236,211,150,1)", 0.25);
    const make = (anyY) => {
      const z = Math.random();                       // 0 = far, 1 = near
      return {
        x: Math.random() * W, y: anyY ? Math.random() * H : -20 - Math.random() * 60, z,
        r: 0.9 + z * z * (mobile ? 2.4 : 3),          // radius
        vy: 0.25 + z * 0.95, sway: 0.3 + Math.random() * 0.9, ph: Math.random() * 6.28,
        a: 0.22 + z * 0.5, gold: Math.random() < 0.04,
      };
    };
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
      sc.width = W * dpr; sc.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(mobile ? 70 : 140, (W * H) / (mobile ? 4200 : 9000)));
      flakes = Array.from({ length: n }, () => make(true));
    };
    const frame = (t) => {
      ctx.clearRect(0, 0, W, H);
      const dy = scrollY - lastY; lastY = scrollY;
      drift += (Math.max(-40, Math.min(40, dy)) - drift) * 0.1;   // flakes lag behind scroll = depth
      for (const f of flakes) {
        f.ph += 0.008 + f.z * 0.01;
        f.y += f.vy - drift * (0.15 + f.z * 0.35);
        f.x += Math.sin(f.ph) * f.sway * (0.4 + f.z * 0.6) + 0.12;
        if (f.y > H + 20 || f.x > W + 20 || f.x < -20) Object.assign(f, make(false));
        if (f.y < -80) f.y = H + 10;
        const d = f.r * 2 * (f.gold ? 0.8 : 1);
        ctx.globalAlpha = f.gold ? f.a * (0.55 + 0.45 * Math.sin(t / 300 + f.ph * 4)) : f.a;
        ctx.drawImage(f.gold ? gold : white, f.x - d, f.y - d, d * 2, d * 2);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    const start = () => { if (running || !snowOn || document.hidden) return; running = true; raf = requestAnimationFrame(frame); };
    const stop = () => { running = false; cancelAnimationFrame(raf); ctx.clearRect(0, 0, W, H); };
    size();
    let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(size, 200); });
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    const apply = () => {
      html.classList.toggle("no-snow", !snowOn);
      if (snowBtn) { snowBtn.setAttribute("aria-pressed", snowOn); snowBtn.setAttribute("aria-label", snowOn ? "Turn snowfall off" : "Turn snowfall on"); }
      snowOn ? start() : stop();
    };
    snowBtn?.addEventListener("click", () => {
      snowOn = !snowOn; try { localStorage.setItem("aura-snow", snowOn ? "on" : "off"); } catch (_) {}
      apply();
    });
    // start after first paint so the page itself loads first
    (document.readyState === "complete" ? (f) => setTimeout(f, 200) : (f) => addEventListener("load", () => setTimeout(f, 200), { once: true }))(apply);
  }

  /* ---------- Palettes ---------- */
  const pal = $("[data-palettes]");
  if (pal) {
    const tabs = $$(".pal-tab", pal), imgs = $$(".pal-stage img", pal);
    const name = $(".pal-name", pal), desc = $(".pal-desc", pal), notes = $(".pal-notes", pal), ask = $(".pal-ask", pal);
    const set = (i, focus) => {
      tabs.forEach((t, j) => { t.setAttribute("aria-selected", i === j); t.tabIndex = i === j ? 0 : -1; });
      imgs.forEach((im, j) => im.classList.toggle("is-on", i === j));
      const t = tabs[i];
      name.textContent = t.dataset.name; desc.textContent = t.dataset.desc;
      notes.innerHTML = t.dataset.notes.split("|").map((s) => `<li>${s}</li>`).join("");
      ask.href = waLink(`Hi Aura, I love the ${t.dataset.name} palette. Could you help me plan it for my home?`);
      if (focus) t.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => set(i));
      t.addEventListener("keydown", (e) => {
        const k = e.key; if (!/Arrow(Right|Left|Down|Up)/.test(k)) return;
        e.preventDefault(); const d = /Right|Down/.test(k) ? 1 : -1;
        set((i + d + tabs.length) % tabs.length, true);
      });
    });
    set(0);
  }

  const rib = $(".ribbon");
  if (rib) new IntersectionObserver(([e]) => rib.classList.toggle("is-off", !e.isIntersecting)).observe(rib);

  /* ---------- Rail progress (mobile swipe) ---------- */
  const rail = $(".rail"), bar = $(".rail-hint i b");
  if (rail && bar) rail.addEventListener("scroll", () => {
    const p = rail.scrollLeft / Math.max(1, rail.scrollWidth - rail.clientWidth);
    bar.style.transform = `translateX(${p * 300}%)`;
  }, { passive: true });

  /* ---------- Work: filters + lightbox ---------- */
  const tiles = $$(".tile");
  $$(".filters .chip").forEach((c, _, all) => c.addEventListener("click", () => {
    all.forEach((x) => x.setAttribute("aria-pressed", x === c));
    const f = c.dataset.filter;
    tiles.forEach((t) => t.classList.toggle("is-out", f !== "all" && !t.dataset.cat.includes(f)));
    window.ScrollTrigger && ScrollTrigger.refresh();
  }));
  const lb = $(".lb");
  if (lb && tiles.length) {
    const img = $("img", lb), cap = $(".lb-cap", lb), cnt = $(".lb-count", lb);
    let list = [], i = 0, opener;
    const show = () => {
      const t = list[i], src = $("img", t);
      img.src = src.dataset.full || src.currentSrc || src.src; img.alt = src.alt;
      cap.textContent = $("figcaption", t)?.textContent || "";
      cnt.textContent = `${i + 1} / ${list.length}`;
      const ask = $(".lb-ask a", lb);
      if (ask) ask.href = waLink(`Hi Aura, I saw the "${cap.textContent}" on your website. Could you do something similar for me?`);
    };
    const open = (t) => {
      opener = t; list = tiles.filter((x) => !x.classList.contains("is-out")); i = list.indexOf(t);
      show(); lb.hidden = false; document.body.style.overflow = "hidden"; window.__lenis?.stop();
      $(".lb-close", lb).focus();
    };
    const close = () => { lb.hidden = true; document.body.style.overflow = ""; window.__lenis?.start(); opener?.focus(); };
    const step = (d) => { i = (i + d + list.length) % list.length; show(); };
    tiles.forEach((t) => t.addEventListener("click", () => open(t)));
    $(".lb-close", lb).onclick = close;
    $(".lb-prev", lb).onclick = () => step(-1);
    $(".lb-next", lb).onclick = () => step(1);
    addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") close(); if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1);
    });
    let sx = null;
    lb.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
    lb.addEventListener("touchend", (e) => {
      if (sx === null) return; const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); sx = null;
    });
  }

  /* ---------- Enquiry composer → WhatsApp ---------- */
  const form = $("#composer");
  if (form) {
    const pv = $("#preview");
    const build = () => {
      const fd = new FormData(form);
      const items = fd.getAll("items");
      const lines = [
        `Hi Aura, I'd like to plan Christmas décor${fd.get("name") ? ` — this is ${fd.get("name").trim()}` : ""}.`,
        fd.get("space") && `Space: ${fd.get("space")}${fd.get("area") ? `, ${fd.get("area")}` : ""}`,
        items.length && `Looking for: ${items.join(", ")}`,
        fd.get("palette") && `Palette: ${fd.get("palette")}`,
        fd.get("when") && `Timing: ${fd.get("when")}`,
        fd.get("notes")?.trim() && `Notes: ${fd.get("notes").trim()}`,
      ].filter(Boolean);
      return lines.join("\n");
    };
    const upd = () => (pv.textContent = build());
    form.addEventListener("input", upd); form.addEventListener("change", upd); upd();
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const a = document.createElement("a");
      a.href = waLink(build()); a.target = "_blank"; a.rel = "noopener";
      document.body.appendChild(a); a.click(); a.remove();
    });
    const pre = new URLSearchParams(location.search).get("palette");
    if (pre && form.palette) { form.palette.value = pre; upd(); }
  }

  /* ---------- Copy number ---------- */
  $$("[data-copy]").forEach((b) => b.addEventListener("click", async () => {
    const t = b.dataset.copy, old = b.textContent;
    try { await navigator.clipboard.writeText(t); b.textContent = "Copied"; }
    catch { const r = document.createRange(); r.selectNodeContents(b.previousElementSibling || b); getSelection().removeAllRanges(); getSelection().addRange(r); b.textContent = "Selected"; }
    setTimeout(() => (b.textContent = old), 1800);
  }));

  /* ---------- Floating WhatsApp: appears once the hero CTA is gone, steps aside for the footer ---------- */
  const fl = $(".wa-float");
  if (fl) {
    const heroCta = $(".hero .btn-velvet"), foot = $(".site-footer");
    const state = { cta: !!heroCta, foot: false };
    const apply = () => fl.classList.toggle("is-tucked", state.cta || state.foot);
    if (heroCta) new IntersectionObserver(([e]) => { state.cta = e.isIntersecting || e.boundingClientRect.top > 0; apply(); }).observe(heroCta);
    if (!heroCta) { state.cta = true; const f = () => { state.cta = scrollY < 600; apply(); }; addEventListener("scroll", f, { passive: true }); f(); }
    if (foot) new IntersectionObserver(([e]) => { state.foot = e.isIntersecting; apply(); }).observe(foot);
    apply();
  }

  /* ---------- Gilt outline around the hero arch (desktop) ---------- */
  const al = $(".arch-line");
  const drawArch = () => {
    if (!al || getComputedStyle(al).display === "none") return;
    const st = al.parentElement, W = st.clientWidth, H = st.clientHeight, r = W / 2 - 0.5;
    al.setAttribute("viewBox", `0 0 ${W} ${H}`); al.setAttribute("width", W); al.setAttribute("height", H);
    const path = al.firstElementChild;
    path.setAttribute("d", `M0.5 ${H} V${W / 2} A${r} ${r} 0 0 1 ${W - 0.5} ${W / 2} V${H}`);
    return path;
  };
  const archPath = drawArch();
  addEventListener("resize", drawArch);

  /* ==========================================================
     Motion layer — only if GSAP loaded and motion allowed
     ========================================================== */
  if (reduce || !window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });
  const hasHero = !!$(".hero");
  html.classList.add("gsap-on");

  if (window.Lenis && !matchMedia("(pointer: coarse)").matches) {
    const lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
    window.__lenis = lenis;
    // let the browser own pinch / Ctrl+wheel zoom, then re-measure the page
    addEventListener("wheel", (e) => { if (e.ctrlKey) { lenis.stop(); clearTimeout(window.__zt); window.__zt = setTimeout(() => lenis.start(), 400); } }, { passive: true, capture: true });
    addEventListener("resize", () => { lenis.resize(); ScrollTrigger.refresh(); });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const intro = entering && canAnimate ? 0.55 : 0.05;
  // hero lines rise out of their masks
  gsap.from(".hero-title .line > span, .page-title .line > span", {
    yPercent: 110, rotate: 2, duration: 1.3, ease: "expo.out", stagger: 0.09, delay: intro,
  });
  gsap.from("[data-intro]", { y: 18, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, delay: intro + 0.35 });

  const mm = gsap.matchMedia();
  if (hasHero) mm.add("(max-width: 899px)", () => {
    // the arched doorway opens to full-bleed as you scroll into it
    gsap.fromTo(".hero .arch",
      { clipPath: "inset(0% 9% 0% 9% round 41vw 41vw 0vw 0vw)" },
      { clipPath: "inset(0% 0% 0% 0% round 0vw 0vw 0vw 0vw)", ease: "none",
        scrollTrigger: { trigger: ".hero-stage", start: "top 75%", end: "top 5%", scrub: true } });
  });
  if (hasHero) mm.add("(min-width: 900px)", () => {
    gsap.fromTo(".hero .arch video", { scale: 1.12 }, { scale: 1, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    if (archPath) {
      const len = archPath.getTotalLength();
      gsap.fromTo(archPath, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut", delay: intro + 0.3 });
    }
  });

  // reveals
  $$("[data-reveal]").forEach((el) => {
    gsap.from(el, { y: 36, opacity: 0, duration: 1.2, ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true } });
  });
  $$("[data-reveal-img]").forEach((el) => {
    gsap.fromTo(el, { clipPath: "inset(12% 8% 12% 8%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.out", clearProps: "clipPath",
      scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    const im = el.querySelector("img,video");
    if (im) gsap.fromTo(im, { scale: 1.2 }, { scale: 1, duration: 1.8, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
  });


  addEventListener("load", () => ScrollTrigger.refresh());
})();
