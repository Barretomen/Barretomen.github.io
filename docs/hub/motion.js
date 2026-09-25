/* Progressive enhancement: the document is readable before any library loads. */
(function () {
  "use strict";
  if (!document.body.classList.contains("home") || !window.gsap || !window.ScrollTrigger) return;
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
  var media = gsap.matchMedia();
  var teardown = function () {};

  function initHeroMotion() {
    // Never hide the hero when restoring scroll/history to a later scene.
    if (window.scrollY > 100) return;
    gsap.timeline({ defaults: { ease: "power3.out", duration: 0.7 } })
      .from(".intro-meta", { opacity: 0, y: 8 })
      .from(".discipline", { opacity: 0, y: 8 }, 0.1)
      .from(".title-mask > span", { yPercent: 110, stagger: 0.1 }, 0.2)
      .from(".signal-line", { scaleX: 0, duration: 0.9 }, 0.35)
      .from(".intro-detail p, .intro-actions, .intro-bottom", { opacity: 0, stagger: 0.08 }, 0.45);
  }

  function initManifesto() {
    var scene = document.querySelector(".manifesto");
    var beats = gsap.utils.toArray(".manifesto-beat");
    scene.classList.add("is-pinned");
    gsap.set(beats.slice(1), { autoAlpha: 0, yPercent: 25 });
    var timeline = gsap.timeline({ scrollTrigger: { trigger: scene, start: "top 80px", end: "+=1600", pin: true, scrub: 0.35, anticipatePin: 1, invalidateOnRefresh: true } });
    timeline.addLabel("problema", 0).to({}, { duration: 0.45 });
    beats.slice(1).forEach(function (beat, index) {
      var at = 0.45 + index * 1.2;
      timeline.addLabel("ideia-" + (index + 1), at)
        .to(beats[index], { yPercent: -25, autoAlpha: 0, duration: 0.4, ease: "power2.in" }, at)
        .to(beat, { yPercent: 0, autoAlpha: 1, duration: 0.55, ease: "power3.out" }, at + 0.3);
    });
    timeline.to({}, { duration: 0.6 }).from(".manifesto-rule", { scaleX: 0.05, ease: "none", duration: timeline.duration() }, 0);
    return function () { scene.classList.remove("is-pinned"); };
  }

  function initProjectStory(lenis) {
    var scene = document.querySelector(".work");
    var stage = scene.querySelector(".work-stage");
    var panels = gsap.utils.toArray(".project-panel");
    if (panels.length < 2) return function () {};
    var controls = scene.querySelector(".work-controls");
    var tabs = scene.querySelector(".project-tabs");
    scene.classList.add("is-pinned");
    controls.hidden = false;
    var active = -1;
    var buttons = panels.map(function (panel, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = String(index + 1).padStart(2, "0");
      button.setAttribute("aria-label", "Mostrar " + panel.querySelector("h3").textContent);
      tabs.append(button);
      return button;
    });
    function activate(index) {
      if (index === active) return;
      active = index;
      panels.forEach(function (panel, i) {
        // Only the presented project can receive focus; tab controls expose every case.
        panel.inert = i !== index;
        panel.setAttribute("aria-hidden", i === index ? "false" : "true");
        buttons[i].setAttribute("aria-pressed", i === index ? "true" : "false");
      });
    }
    gsap.set(panels.slice(1), { autoAlpha: 0 });
    var timeline = gsap.timeline({ scrollTrigger: { trigger: stage, start: "top 80px", end: function () { return "+=" + panels.length * Math.max(650, innerHeight * 0.85); }, pin: true, scrub: 0.3, anticipatePin: 1, invalidateOnRefresh: true }, onUpdate: function () { activate(Math.min(panels.length - 1, Math.floor(timeline.time() + 0.3))); } });
    panels.forEach(function (panel, i) {
      timeline.addLabel("project-" + i, i);
      if (i === 0) return;
      timeline.to(panels[i - 1], { autoAlpha: 0, duration: 0.2 }, i - 0.4)
        .to(panels[i - 1].querySelector(".project-copy"), { y: -32, duration: 0.35 }, i - 0.4)
        .to(panel, { autoAlpha: 1, duration: 0.2 }, i - 0.2)
        .from(panel.querySelector(".project-copy"), { y: 40, duration: 0.45, ease: "power3.out" }, i - 0.2)
        .from(panel.querySelector(".project-visual"), { x: 24, scale: 0.97, duration: 0.45, ease: "power3.out" }, i - 0.2);
    });
    timeline.to({}, { duration: 0.65 });
    activate(0);
    var handlers = buttons.map(function (button, i) {
      var handler = function () {
        var trigger = timeline.scrollTrigger;
        var position = trigger.start + ((i + 0.3) / timeline.duration()) * (trigger.end - trigger.start);
        if (lenis) lenis.scrollTo(position, { immediate: true });
        else window.scrollTo({ top: position, behavior: "instant" });
      };
      button.addEventListener("click", handler);
      return handler;
    });
    return function () {
      buttons.forEach(function (button, i) { button.removeEventListener("click", handlers[i]); });
      tabs.replaceChildren();
      controls.hidden = true;
      scene.classList.remove("is-pinned");
      panels.forEach(function (panel) { panel.inert = false; panel.removeAttribute("aria-hidden"); });
    };
  }

  function initProcessTimeline() {
    gsap.utils.toArray(".process-list li").forEach(function (step) {
      var fill = step.querySelector(".process-fill");
      var timeline = gsap.timeline({ scrollTrigger: { trigger: step, start: "top 75%", end: "bottom 45%", scrub: true } });
      timeline.fromTo(step.querySelector(".process-number"), { borderColor: "#375362" }, { borderColor: "#5ddcf2", ease: "none" }, 0);
      if (fill) timeline.from(fill, { scaleY: 0, ease: "none" }, 0);
    });
  }

  function initFooterMotion() {
    gsap.timeline({ scrollTrigger: { trigger: ".closing", start: "top 85%", end: "top 35%", scrub: true } })
      .from(".closing-line", { scaleX: 0.08, ease: "none" });
  }

  function start() {
    media.add({ desktop: "(min-width: 1024px) and (min-height: 700px)", fine: "(pointer: fine)", motion: "(prefers-reduced-motion: no-preference)" }, function (context) {
      if (!context.conditions.motion) return;
      var cleanups = [];
      var lenis;
      if (context.conditions.desktop && context.conditions.fine && window.Lenis) {
        lenis = new window.Lenis({ lerp: 0.16, smoothWheel: true, syncTouch: false, anchors: true, autoRaf: false });
        var tick = function (time) { lenis.raf(time * 1000); };
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(tick);
        var visibility = function () { if (document.hidden) gsap.ticker.remove(tick); else gsap.ticker.add(tick); };
        document.addEventListener("visibilitychange", visibility);
        cleanups.push(function () { document.removeEventListener("visibilitychange", visibility); gsap.ticker.remove(tick); lenis.destroy(); });
      }
      try {
        initHeroMotion();
        gsap.to(".reading-progress span", { scaleX: 1, ease: "none", scrollTrigger: { trigger: document.body, start: "top top", end: "max", scrub: true, refreshPriority: -1 } });
        if (context.conditions.desktop) {
          cleanups.push(initManifesto());
          cleanups.push(initProjectStory(lenis));
        }
        initProcessTimeline();
        initFooterMotion();
      } catch (error) {
        cleanups.reverse().forEach(function (cleanup) { cleanup(); });
        throw error;
      }
      return function () { cleanups.reverse().forEach(function (cleanup) { cleanup(); }); };
    });
    var refresh = function () { ScrollTrigger.refresh(); };
    window.addEventListener("load", refresh, { once: true });
    var alive = true;
    if (document.fonts) document.fonts.ready.then(function () { if (alive) refresh(); });
    refresh();
    teardown = function () { alive = false; window.removeEventListener("load", refresh); media.revert(); };
  }
  start();
  window.addEventListener("pagehide", function () { teardown(); });
  window.addEventListener("pageshow", function (event) { if (event.persisted) start(); });
}());
