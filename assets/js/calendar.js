(function () {
  "use strict";

  function buildGoogleCalendarUrl(event) {
    const url = new URL("https://calendar.google.com/calendar/render");
    url.search = new URLSearchParams({
      action: "TEMPLATE",
      text: event.title,
      dates: event.dates,
      details: event.details,
      location: event.location,
      ctz: "Asia/Kolkata"
    }).toString();
    return url.toString();
  }

  function initCalendar(config) {
    const weddingLink = document.getElementById("weddingGoogleCalendar");
    const receptionLink = document.getElementById("receptionGoogleCalendar");

    if (weddingLink) {
      weddingLink.href = buildGoogleCalendarUrl({
        title: config.calendar.weddingTitle,
        dates: config.calendar.weddingUtc,
        details: config.calendar.weddingDescription,
        location: `${config.wedding.venue}, ${config.wedding.address}`
      });
    }

    if (receptionLink) {
      receptionLink.href = buildGoogleCalendarUrl({
        title: config.calendar.receptionTitle,
        dates: config.calendar.receptionUtc,
        details: config.calendar.receptionDescription,
        location: `${config.reception.venue}, ${config.reception.address}`
      });
    }

    const weddingEvent = {
      uid: `wedding-${config.wedding.startIso.slice(0, 10).replace(/-/g, "")}@ajeesh-sona`,
      title: config.calendar.weddingTitle,
      description: config.calendar.weddingDescription,
      startIso: config.wedding.startIso,
      endIso: config.wedding.endIso,
      location: `${config.wedding.venue}, ${config.wedding.address}`
    };
    const receptionEvent = {
      uid: `reception-${config.reception.startIso.slice(0, 10).replace(/-/g, "")}@ajeesh-sona`,
      title: config.calendar.receptionTitle,
      description: config.calendar.receptionDescription,
      startIso: config.reception.startIso,
      endIso: config.reception.endIso,
      location: `${config.reception.venue}, ${config.reception.address}`
    };

    setIcsDownload("weddingIcsDownload", "wedding.ics", createIcs([weddingEvent]));
    setIcsDownload("receptionIcsDownload", "reception.ics", createIcs([receptionEvent]));
    setIcsDownload("bothIcsDownload", "wedding-and-reception.ics", createIcs([weddingEvent, receptionEvent]));
  }

  function escapeIcsText(value) {
    return String(value)
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  }

  function toIcsLocal(isoValue) {
    const match = String(isoValue).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (!match) {
      throw new Error("Invalid calendar date.");
    }
    return `${match[1]}${match[2]}${match[3]}T${match[4]}${match[5]}${match[6]}`;
  }

  function foldIcsLine(line) {
    const segments = [];
    const encoder = new TextEncoder();
    let current = "";
    for (const character of line) {
      if (encoder.encode(current + character).length > 73) {
        segments.push(current);
        current = ` ${character}`;
      } else {
        current += character;
      }
    }
    segments.push(current);
    return segments.join("\r\n");
  }

  function createIcs(events) {
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Ajeesh and Sona//Wedding Invitation//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VTIMEZONE",
      "TZID:Asia/Kolkata",
      "X-LIC-LOCATION:Asia/Kolkata",
      "BEGIN:STANDARD",
      "TZOFFSETFROM:+0530",
      "TZOFFSETTO:+0530",
      "TZNAME:IST",
      "DTSTART:19700101T000000",
      "END:STANDARD",
      "END:VTIMEZONE"
    ];

    events.forEach((event) => {
      lines.push(
        "BEGIN:VEVENT",
        `UID:${event.uid}`,
        "DTSTAMP:20260719T080000Z",
        `DTSTART;TZID=Asia/Kolkata:${toIcsLocal(event.startIso)}`,
        `DTEND;TZID=Asia/Kolkata:${toIcsLocal(event.endIso)}`,
        `SUMMARY:${escapeIcsText(event.title)}`,
        `LOCATION:${escapeIcsText(event.location)}`,
        `DESCRIPTION:${escapeIcsText(event.description)}`,
        "STATUS:CONFIRMED",
        "TRANSP:OPAQUE",
        "END:VEVENT"
      );
    });
    lines.push("END:VCALENDAR");
    return `${lines.map(foldIcsLine).join("\r\n")}\r\n`;
  }

  function setIcsDownload(id, filename, contents) {
    const link = document.getElementById(id);
    if (!link || typeof URL.createObjectURL !== "function") {
      return;
    }
    const objectUrl = URL.createObjectURL(new Blob([contents], { type: "text/calendar;charset=utf-8" }));
    link.href = objectUrl;
    link.download = filename;
  }

  window.WeddingCalendar = Object.freeze({
    buildGoogleCalendarUrl,
    createIcs,
    init: initCalendar
  });
})();
