(function () {
  "use strict";

  // Replace SITE_URL after GitHub Pages is enabled. Keep the trailing slash.
  const SITE_URL = "https://USERNAME.github.io/ajeesh-sona/";

  window.WEDDING_CONFIG = Object.freeze({
    siteUrl: SITE_URL,
    couple: Object.freeze({
      displayNames: "Ajeesh & Sona",
      shortOne: "Ajeesh",
      shortTwo: "Sona",
      personOne: "Dr. Ajeesh Anilkumar",
      personTwo: "Dr. Sona S.P"
    }),
    wedding: Object.freeze({
      dayLabel: "Sunday",
      dateLabel: "Sunday, 13 September 2026",
      numericDate: "13 · 09 · 2026",
      dayNumber: "13",
      monthShort: "SEP",
      year: "2026",
      malayalamDate: "1202 Chingam 28",
      startIso: "2026-09-13T10:00:00+05:30",
      endIso: "2026-09-13T10:30:00+05:30",
      startTime: "10:00",
      startMeridiem: "AM",
      endTime: "10:30 AM",
      departure: "7:30 AM",
      venue: "Royal Regency Convention Centre",
      address: "Oachira, Kerala",
      mapCity: "Oachira",
      locationLabel: "Oachira · Kerala",
      mapListingLabel: "Maps listing: Regency Hall at Royale Regency",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Regency%20Hall%2C%20Oachira%2C%20Kerala&query_place_id=ChIJlwh6S8McBjsRTmJkjw3R2ac",
      directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Regency%20Hall%2C%20Oachira%2C%20Kerala&destination_place_id=ChIJlwh6S8McBjsRTmJkjw3R2ac"
    }),
    reception: Object.freeze({
      dateLabel: "Sunday, 13 September 2026",
      startIso: "2026-09-13T17:00:00+05:30",
      endIso: "2026-09-13T20:00:00+05:30",
      startTime: "5:00 PM",
      endTime: "8:00 PM",
      venue: "Lalas Convention Centre",
      address: "Mevaram, Kollam, Kerala",
      mapCity: "Mevaram",
      mapListingLabel: "Maps listing: Lalas Convention Centre, Thattamala",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Lalas%20Convention%20Centre%2C%20Kollam%2C%20Kerala&query_place_id=ChIJ2TWrP7P8BTsRLfoVK5Hp66E",
      directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Lalas%20Convention%20Centre%2C%20Kollam%2C%20Kerala&destination_place_id=ChIJ2TWrP7P8BTsRLfoVK5Hp66E"
    }),
    calendar: Object.freeze({
      weddingUtc: "20260913T043000Z/20260913T050000Z",
      receptionUtc: "20260913T113000Z/20260913T143000Z",
      weddingTitle: "Ajeesh & Sona Wedding",
      weddingDescription: "We would be delighted to celebrate with you. Muhurtham: 10:00 AM to 10:30 AM. Optional departure time: 7:30 AM.",
      receptionTitle: "Ajeesh & Sona Wedding Reception",
      receptionDescription: "Join Ajeesh and Sona for their wedding reception from 5:00 PM to 8:00 PM."
    }),
    media: Object.freeze({
      music: "./assets/audio/wedding-theme.mp3",
      emblem: "./assets/images/couple-emblem.png",
      emblemFallback: "./assets/images/couple-emblem.svg",
      emblemSrcset: Object.freeze([
        "./assets/images/couple-emblem-480.jpg 480w",
        "./assets/images/couple-emblem-768.jpg 768w",
        "./assets/images/couple-emblem-1024.jpg 1024w"
      ]),
      emblemAlt: "Ajeesh and Sona wedding emblem",
      photos: Object.freeze([
        "./assets/images/couple-01.jpg",
        "./assets/images/couple-02.jpg",
        "./assets/images/couple-03.jpg",
        "./assets/images/couple-04.jpg"
      ]),
      photoAlt: Object.freeze([
        "Ajeesh and Sona sharing a quiet moment beneath leafy branches.",
        "Ajeesh and Sona posing together beside a red garden bench.",
        "Ajeesh and Sona in teal and green attire, standing close together.",
        "Ajeesh and Sona walking hand in hand beneath warm decorative lights."
      ])
    }),
    share: Object.freeze({
      message: "We would be delighted to celebrate our wedding with you. Ajeesh & Sona · Sunday, 13 September 2026."
    })
  });
})();
