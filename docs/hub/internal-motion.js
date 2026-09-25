(() => {
  "use strict";

  if (!document.body.classList.contains("inner-page") || !window.gsap || !window.ScrollTrigger) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let context;

  function destroy() {
    if (context) context.revert();
    context = null;
  }

  function start() {
    destroy();
    if (reduceMotion.matches) return;

    window.gsap.registerPlugin(window.ScrollTrigger);
    context = window.gsap.context(() => {
      const heroItems = [
        ".page-kicker",
        ".page-hero h1",
        ".page-hero__statement",
        ".page-hero .hero-actions",
        ".page-hero__aside",
      ].filter((selector) => document.querySelector(selector));

      window.gsap.from(heroItems, {
        y: 28,
        autoAlpha: 0,
        duration: 0.85,
        stagger: 0.09,
        ease: "power4.out",
        clearProps: "transform,opacity,visibility",
      });

      window.gsap.utils.toArray(".content-section").forEach((section) => {
        window.gsap.from(section, {
          y: 30,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.out",
          clearProps: "transform,opacity,visibility",
          scrollTrigger: {
            trigger: section,
            start: "top 86%",
            once: true,
          },
        });
      });
    });

    window.addEventListener("load", () => window.ScrollTrigger.refresh(), { once: true });
  }

  reduceMotion.addEventListener?.("change", start);
  window.addEventListener("pagehide", destroy, { once: true });
  start();
})();
