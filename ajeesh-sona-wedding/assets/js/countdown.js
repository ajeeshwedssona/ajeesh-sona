(function () {
  "use strict";

  const DAY_MS = 86_400_000;
  const HOUR_MS = 3_600_000;
  const MINUTE_MS = 60_000;
  function initCountdown(config) {
    const grid = document.getElementById("countdownGrid");
    const status = document.getElementById("countdownStatus");
    const fields = {
      days: document.getElementById("countdownDays"),
      hours: document.getElementById("countdownHours"),
      minutes: document.getElementById("countdownMinutes"),
      seconds: document.getElementById("countdownSeconds")
    };

    if (!grid || !status || Object.values(fields).some((field) => !field)) {
      return;
    }

    const weddingStart = Date.parse(config.wedding.startIso);
    const weddingDayEnd = Date.parse(`${config.wedding.startIso.slice(0, 10)}T23:59:59+05:30`);
    if (!Number.isFinite(weddingStart)) {
      status.textContent = config.wedding.dateLabel;
      return;
    }

    let timerId = 0;

    function showMessage(message) {
      grid.classList.add("is-complete");
      grid.innerHTML = "";
      const paragraph = document.createElement("p");
      paragraph.textContent = message;
      grid.appendChild(paragraph);
      if (timerId) {
        window.clearInterval(timerId);
      }
    }

    function update() {
      const now = Date.now();
      const difference = weddingStart - now;

      if (difference <= 0) {
        if (now <= weddingDayEnd) {
          status.textContent = "The celebration is here.";
          showMessage("Today is the day.");
        } else {
          status.textContent = "With gratitude for a beautiful day.";
          showMessage(`Celebrated with love on ${config.wedding.dateLabel.replace(/^[^,]+,\s*/, "")}.`);
        }
        return;
      }

      const days = Math.floor(difference / DAY_MS);
      const hours = Math.floor((difference % DAY_MS) / HOUR_MS);
      const minutes = Math.floor((difference % HOUR_MS) / MINUTE_MS);
      const seconds = Math.floor((difference % MINUTE_MS) / 1000);

      fields.days.textContent = String(days).padStart(3, "0");
      fields.hours.textContent = String(hours).padStart(2, "0");
      fields.minutes.textContent = String(minutes).padStart(2, "0");
      fields.seconds.textContent = String(seconds).padStart(2, "0");
    }

    update();
    if (Date.now() < weddingStart) {
      timerId = window.setInterval(update, 1000);
    }
  }

  window.WeddingCountdown = Object.freeze({ init: initCountdown });
})();
