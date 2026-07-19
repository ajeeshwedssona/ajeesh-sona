(function () {
  "use strict";

  const config = window.WEDDING_CONFIG;
  if (!config) {
    return;
  }

  const toast = document.getElementById("toast");
  let toastTimer = 0;
  let guestName = "";

  function sanitizeGuestName(value) {
    return String(value || "")
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);
  }

  function getGuestName() {
    return guestName;
  }

  function configuredSiteUrlIsPlaceholder() {
    return /USERNAME/i.test(config.siteUrl);
  }

  function isWebUrl(url) {
    return url.protocol === "https:" || url.protocol === "http:";
  }

  function getCurrentUrl() {
    try {
      return new URL(window.location.href);
    } catch (error) {
      return new URL(config.siteUrl);
    }
  }

  function getBaseInvitationUrl() {
    const current = getCurrentUrl();
    if (isWebUrl(current)) {
      current.hash = "";
      return current.toString();
    }
    return config.siteUrl;
  }

  function getShareUrl() {
    const current = getCurrentUrl();
    if (isWebUrl(current)) {
      current.hash = "";
      return current.toString();
    }
    return config.siteUrl;
  }

  function getQrUrl() {
    const current = getCurrentUrl();
    const isProductionPage = (
      current.protocol === "https:" &&
      !/^(localhost|127\.0\.0\.1|\[::1\])$/i.test(current.hostname)
    );

    if (isProductionPage) {
      current.search = "";
      current.hash = "";
      return current.toString();
    }

    if (!configuredSiteUrlIsPlaceholder()) {
      return config.siteUrl;
    }

    return config.siteUrl;
  }

  function showToast(message) {
    if (!toast) {
      return;
    }
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2800);
  }

  async function copyText(value) {
    if (!value) {
      return false;
    }
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(value);
        return true;
      } catch (error) {
        // Continue to the selection-based fallback.
      }
    }

    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }
    field.remove();
    return copied;
  }

  function setText(selector, value) {
    if (value === undefined || value === null) {
      return;
    }
    document.querySelectorAll(selector).forEach((element) => {
      element.textContent = value;
    });
  }

  function initConfiguredContent() {
    const textBindings = [
      ["[data-name-one]", config.couple.shortOne],
      ["[data-name-two]", config.couple.shortTwo],
      ["[data-full-name-one]", config.couple.personOne],
      ["[data-full-name-two]", config.couple.personTwo],
      ["[data-display-names]", config.couple.displayNames],
      ["[data-day-label]", config.wedding.dayLabel],
      ["[data-date-label]", config.wedding.dateLabel],
      ["[data-date-numeric]", config.wedding.numericDate],
      ["[data-date-day]", config.wedding.dayNumber],
      ["[data-date-month]", config.wedding.monthShort],
      ["[data-date-year]", config.wedding.year],
      ["[data-malayalam-date]", config.wedding.malayalamDate],
      ["[data-wedding-location]", config.wedding.locationLabel],
      ["[data-wedding-start]", config.wedding.startTime],
      ["[data-wedding-meridiem]", config.wedding.startMeridiem],
      ["[data-wedding-end]", config.wedding.endTime],
      ["[data-departure]", config.wedding.departure],
      ["[data-wedding-venue]", config.wedding.venue],
      ["[data-wedding-address]", config.wedding.address],
      ["[data-wedding-map-city]", config.wedding.mapCity],
      ["[data-wedding-map-listing]", config.wedding.mapListingLabel],
      ["[data-reception-date]", config.reception.dateLabel],
      ["[data-reception-start]", config.reception.startTime],
      ["[data-reception-end]", config.reception.endTime],
      ["[data-reception-venue]", config.reception.venue],
      ["[data-reception-address]", config.reception.address],
      ["[data-reception-map-city]", config.reception.mapCity],
      ["[data-reception-map-listing]", config.reception.mapListingLabel]
    ];
    textBindings.forEach(([selector, value]) => setText(selector, value));

    document.title = `${config.couple.displayNames} — Wedding Invitation`;
    const description = document.getElementById("metaDescription");
    if (description) {
      description.content = `The wedding invitation of ${config.couple.shortOne} and ${config.couple.shortTwo} — ${config.wedding.dateLabel} in Kerala.`;
    }

    document.querySelectorAll("[data-emblem]").forEach((image) => {
      image.dataset.fallbackSrc = config.media.emblemFallback;
      image.srcset = config.media.emblemSrcset.join(", ");
      if (image.dataset.emblemSize === "opening") {
        image.sizes = "(max-height: 38rem) 9.5rem, (max-width: 40rem) 72vw, 17rem";
      } else if (image.dataset.emblemSize === "hero") {
        image.sizes = "(max-width: 59.99rem) 86vw, 21rem";
      } else {
        image.sizes = "8rem";
      }
      if (image.hasAttribute("data-emblem-alt")) {
        image.alt = config.media.emblemAlt;
      }
      image.width = 1254;
      image.height = 1254;
      image.classList.remove("is-svg-fallback");
      image.src = config.media.emblem;
    });

    document.querySelectorAll("[data-photo-index]").forEach((image) => {
      const index = Number(image.dataset.photoIndex);
      if (config.media.photos[index]) {
        image.src = config.media.photos[index];
      }
      if (config.media.photoAlt[index]) {
        image.alt = config.media.photoAlt[index];
      }
    });
  }

  function initPersonalGreeting() {
    const parameters = new URLSearchParams(window.location.search);
    const requestedName = parameters.has("guest") ? parameters.get("guest") : parameters.get("to");
    guestName = sanitizeGuestName(requestedName);

    if (!guestName) {
      return;
    }

    const greeting = document.getElementById("personalGreeting");
    const coverGreeting = document.getElementById("coverGuest");

    if (greeting) {
      greeting.textContent = `Dear ${guestName}, we would be delighted to celebrate this day with you.`;
      greeting.hidden = false;
    }

    if (coverGreeting) {
      coverGreeting.textContent = `For ${guestName}`;
      coverGreeting.hidden = false;
    }
  }

  function initVenueLinks() {
    const links = {
      weddingMapLink: config.wedding.mapUrl,
      weddingDirectionsLink: config.wedding.directionsUrl,
      receptionMapLink: config.reception.mapUrl,
      receptionDirectionsLink: config.reception.directionsUrl
    };

    Object.entries(links).forEach(([id, href]) => {
      const link = document.getElementById(id);
      if (link) {
        link.href = href;
      }
    });

    document.querySelectorAll(".copy-venue").forEach((button) => {
      const event = config[button.dataset.venue];
      if (event) {
        button.dataset.copy = `${event.venue}, ${event.address}`;
      }
      button.addEventListener("click", async function () {
        const copied = await copyText(button.dataset.copy || "");
        showToast(copied ? "Venue copied." : "Copying is unavailable in this browser.");
      });
    });
  }

  function readSessionPreference(key) {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function writeSessionPreference(key, value) {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      // Session storage can be unavailable in strict privacy modes.
    }
  }

  function initMusic() {
    const audio = document.getElementById("weddingMusic");
    const control = document.getElementById("musicControl");
    const state = document.getElementById("musicState");

    if (!audio || !control || !state) {
      return { start: function () {} };
    }

    audio.src = config.media.music;
    audio.volume = 0.35;

    function updateState() {
      const playing = !audio.paused && !audio.ended;
      control.classList.toggle("is-playing", playing);
      control.setAttribute("aria-pressed", String(playing));
      control.setAttribute("aria-label", playing ? "Pause background music" : "Play background music");
      state.textContent = playing ? "Music playing" : "Music paused";
    }

    async function play() {
      try {
        await audio.play();
        writeSessionPreference("ajeeshSonaMusicMuted", "false");
      } catch (error) {
        updateState();
      }
    }

    function startFromOpeningGesture() {
      const mutedByGuest = readSessionPreference("ajeeshSonaMusicMuted") === "true";
      if (!mutedByGuest) {
        // Called synchronously from the opening tap to retain iOS user activation.
        play();
      } else {
        updateState();
      }
    }

    control.addEventListener("click", function () {
      if (audio.paused) {
        play();
      } else {
        audio.pause();
        writeSessionPreference("ajeeshSonaMusicMuted", "true");
      }
    });

    audio.addEventListener("play", updateState);
    audio.addEventListener("pause", updateState);
    audio.addEventListener("ended", updateState);
    audio.addEventListener("error", updateState);
    updateState();

    return { start: startFromOpeningGesture };
  }

  function createOpeningBurst(container) {
    const constrainedDevice = (
      (navigator.connection && navigator.connection.saveData) ||
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2)
    );
    if (!container || constrainedDevice || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const colors = ["#c78e86", "#ddbd83", "#e9ddca", "#a25749"];
    for (let index = 0; index < 18; index += 1) {
      const angle = (Math.PI * 2 * index) / 18 + (Math.random() - 0.5) * 0.3;
      const distance = 120 + Math.random() * Math.min(window.innerWidth * 0.42, 260);
      const petal = document.createElement("span");
      petal.className = "burst-petal";
      petal.style.setProperty("--petal-x", `${Math.cos(angle) * distance}px`);
      petal.style.setProperty("--petal-y", `${Math.sin(angle) * distance}px`);
      petal.style.setProperty("--petal-rotate", `${180 + Math.random() * 540}deg`);
      petal.style.setProperty("--petal-color", colors[index % colors.length]);
      petal.style.animationDelay = `${Math.random() * 0.14}s`;
      container.appendChild(petal);
      window.setTimeout(() => petal.remove(), 2200);
    }
  }

  function initOpening(music) {
    const cover = document.getElementById("openingCover");
    const openButton = document.getElementById("openInvitation");
    const main = document.getElementById("main-content");
    const burst = document.getElementById("petalBurst");
    const backgroundRegions = Array.from(document.body.children).filter((region) => (
      region !== cover &&
      region.tagName !== "SCRIPT" &&
      region.tagName !== "STYLE"
    ));
    let opened = false;

    backgroundRegions.forEach((region) => {
      region.setAttribute("aria-hidden", "true");
      if ("inert" in region) {
        region.inert = true;
      }
    });

    function revealInvitation() {
      if (opened) {
        return;
      }
      opened = true;
      openButton.disabled = true;
      music.start();
      createOpeningBurst(burst);
      cover.classList.add("is-opening");

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const transitionTime = reducedMotion ? 60 : 1320;
      window.setTimeout(function () {
        cover.hidden = true;
        cover.setAttribute("aria-hidden", "true");
        document.body.classList.remove("invitation-locked");
        backgroundRegions.forEach((region) => {
          region.removeAttribute("aria-hidden");
          if ("inert" in region) {
            region.inert = false;
          }
        });
        window.WeddingAnimations.init();
        if (main) {
          main.setAttribute("tabindex", "-1");
          main.focus({ preventScroll: true });
        }
      }, transitionTime);
    }

    if (openButton && cover) {
      openButton.addEventListener("click", revealInvitation, { once: true });
      cover.addEventListener("keydown", function (event) {
        if (event.key === "Tab") {
          event.preventDefault();
          openButton.focus();
        }
      });
      window.setTimeout(() => openButton.focus(), 50);
    } else {
      document.body.classList.remove("invitation-locked");
      window.WeddingAnimations.init();
    }
  }

  const utils = Object.freeze({
    copyText,
    getBaseInvitationUrl,
    getGuestName,
    getQrUrl,
    getShareUrl,
    sanitizeGuestName,
    showToast
  });

  initConfiguredContent();
  initPersonalGreeting();
  initVenueLinks();
  window.WeddingCountdown.init(config);
  window.WeddingCalendar.init(config);
  window.WeddingSharing.init(config, utils);
  const music = initMusic();
  initOpening(music);
})();
