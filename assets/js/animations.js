(function () {
  "use strict";

  let started = false;
  let ambientTimer = 0;
  let scrollFrame = 0;

  function initAnimations() {
    if (started) {
      return;
    }
    started = true;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const constrainedDevice = (
      (navigator.connection && navigator.connection.saveData) ||
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2)
    );
    const revealItems = document.querySelectorAll(".reveal, .image-reveal");

    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-in-view"));
    } else {
      const revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in-view");
            observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.08
      });

      revealItems.forEach((item) => revealObserver.observe(item));
    }

    initActiveNavigation();

    if (!reducedMotion && !constrainedDevice) {
      initImageDepth();
      startAmbientPetals();
    } else if (constrainedDevice) {
      document.body.classList.add("motion-lite");
    }

    document.addEventListener("visibilitychange", function () {
      document.body.classList.toggle("page-hidden", document.hidden);
    });
  }

  function initActiveNavigation() {
    const targets = Array.from(document.querySelectorAll("[data-nav]"))
      .map((link) => {
        const section = document.getElementById(link.dataset.nav);
        return section ? { link, section } : null;
      })
      .filter(Boolean);

    function update() {
      scrollFrame = 0;
      const marker = window.scrollY + window.innerHeight * 0.34;
      let active = targets[0];
      targets.forEach((target) => {
        if (target.section.offsetTop <= marker) {
          active = target;
        }
      });
      targets.forEach((target) => {
        const isActive = target === active;
        target.link.classList.toggle("is-active", isActive);
        if (isActive) {
          target.link.setAttribute("aria-current", "location");
        } else {
          target.link.removeAttribute("aria-current");
        }
      });
    }

    function requestUpdate() {
      if (!scrollFrame) {
        scrollFrame = window.requestAnimationFrame(update);
      }
    }

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
  }

  function initImageDepth() {
    const portrait = document.querySelector(".hero-portrait");
    if (!portrait || !window.matchMedia("(min-width: 48rem)").matches) {
      return;
    }

    let frame = 0;
    function update() {
      frame = 0;
      const rect = portrait.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        return;
      }
      const progress = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
      portrait.style.transform = `translate3d(0, ${Math.max(-18, Math.min(18, progress * -24)).toFixed(2)}px, 0)`;
    }

    function requestUpdate() {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    }

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
  }

  function spawnAmbientPetal() {
    if (document.hidden || document.querySelectorAll(".ambient-petal").length >= 3) {
      return;
    }
    const petal = document.createElement("span");
    petal.className = "ambient-petal";
    petal.style.left = `${8 + Math.random() * 84}vw`;
    petal.style.setProperty("--fall-duration", `${9 + Math.random() * 4}s`);
    petal.style.setProperty("--fall-drift", `${-40 + Math.random() * 80}px`);
    if (Math.random() > 0.5) {
      petal.style.background = "rgba(188, 141, 77, 0.45)";
    }
    document.body.appendChild(petal);
    window.setTimeout(() => petal.remove(), 14_000);
  }

  function startAmbientPetals() {
    window.setTimeout(spawnAmbientPetal, 3500);
    ambientTimer = window.setInterval(spawnAmbientPetal, 8500);
  }

  window.WeddingAnimations = Object.freeze({
    init: initAnimations,
    stop: function () {
      if (ambientTimer) {
        window.clearInterval(ambientTimer);
      }
    }
  });
})();
