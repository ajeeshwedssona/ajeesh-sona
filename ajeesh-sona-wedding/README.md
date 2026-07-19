# Ajeesh & Sona — Wedding Invitation

A mobile-first, static wedding invitation for Sunday, 13 September 2026. The project uses plain HTML, CSS, and JavaScript and is ready for GitHub Pages.

## Preview locally

Opening `index.html` directly will show the page, but clipboard, sharing, audio, and downloads are more reliable through a local web server.

From the `ajeesh-sona-wedding` folder, run:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000/`.

## Assets

The site expects these exact photo filenames:

- `assets/images/couple-01.jpg`
- `assets/images/couple-02.jpg`
- `assets/images/couple-03.jpg`
- `assets/images/couple-04.jpg`

The first image is the hero portrait, the second is the wide cinematic image, and the final two form the editorial portrait section. Each image has explicit dimensions in `index.html`; if a replacement has a different aspect ratio, update those dimensions and the corresponding `--p1-pos` through `--p4-pos` values near the top of `assets/css/styles.css`.

The site expects this exact music filename:

- `assets/audio/wedding-theme.mp3`

Music starts only after the opening-cover tap, loops at 35% volume, and remembers the guest’s pause choice for the browser session.

The custom couple artwork is:

- `assets/images/couple-emblem.png` — original 1254 × 1254 artwork
- `assets/images/couple-emblem-1024.jpg` — high-density responsive delivery size
- `assets/images/couple-emblem-768.jpg` — high-density phone delivery size
- `assets/images/couple-emblem-480.jpg` — lightweight mobile delivery size
- `assets/images/couple-emblem.svg` — automatic fallback

The opening screen, hero, and closing section keep the original PNG as their base image and use lighter responsive JPEG derivatives for delivery. The full square canvas remains visible, so the illustrated couple, monogram, and floral ring are never cropped. If the raster artwork cannot load, the existing SVG is substituted automatically. Update the emblem paths and alt text in the `media` block of `assets/js/config.js`.

## One configuration file

Edit `assets/js/config.js` to update:

- Couple names and visible labels
- Wedding and reception dates and times
- Malayalam date and departure time
- Venue names and addresses
- Both verified Google Maps listing URLs
- Both Google Maps directions URLs
- Final GitHub Pages URL
- Music and photo filenames
- Default share message

The visible page, Google Calendar links, browser-generated `.ics` downloads, save-the-date PNG, image sources, audio source, and sharing text all read from this file. The values already present in `index.html` and the static calendar files are resilient no-JavaScript fallbacks for the current invitation.

The wedding Maps target is the verified Google listing for **Regency Hall at Royale Regency**, the auditorium associated with the requested “Royal Regency Convention Centre” venue wording. The reception target is the verified **Lalas Convention Centre** listing. Google Maps uses “Thattamala” in its detailed address; the invitation retains the requested broader “Mevaram” area label.

## Set the final website URL

In `assets/js/config.js`, replace:

```js
const SITE_URL = "https://USERNAME.github.io/ajeesh-sona/";
```

Keep the trailing slash. The QR code uses the live HTTPS page automatically after deployment; before deployment it intentionally displays this configuration value. After changing it, reload the page and test the QR code again.

## Personalised guest links

Both formats work:

```text
?to=Rahul
?guest=Rahul%20and%20Family
```

`guest` takes priority when both are present. Guest names are trimmed to 80 characters, control characters are removed, and the greeting is inserted with `textContent`.

The discreet “Personalise a link” action in the sharing section opens a generator that can copy the resulting URL or prepare a WhatsApp message.

## Calendar details

Static no-JavaScript calendar fallbacks are in `calendar/`:

- `wedding.ics`
- `reception.ics`
- `wedding-and-reception.ics`

They use `TZID:Asia/Kolkata`, CRLF line endings, and RFC-compatible line folding. During normal use, `assets/js/calendar.js` generates fresh `.ics` downloads from `assets/js/config.js`, so calendar buttons stay aligned with configuration changes. Google Calendar links use the UTC ranges in the same configuration file.

If event details change, update `assets/js/config.js`. If you also need the downloads to work when JavaScript is completely disabled, mirror the changes in the three fallback `.ics` files.

## Save-the-date and QR

The “Download invitation” button creates a 1080 × 1350 PNG entirely in the browser. It waits briefly for fonts, draws a local QR matrix, and does not use remote images or APIs.

To test the QR code:

1. Set the final `SITE_URL`.
2. Serve or deploy the page.
3. Open the invitation on one device.
4. Scan the on-page QR with a different phone.
5. Confirm the destination and repeat the test on the downloaded save-the-date PNG and downloaded QR SVG.

## Deploy with GitHub Pages

This folder is the deployable site root and already contains `.nojekyll`.

1. Create a GitHub repository, ideally named `ajeesh-sona`.
2. Set the correct `SITE_URL` in `assets/js/config.js`.
3. Commit the contents of this folder at the repository root, or publish this folder with a Pages workflow.
4. In GitHub, open **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select the branch (usually `main`) and `/ (root)`, then save.
7. Wait for GitHub to show the live URL.
8. Open the production URL and re-test music, both Maps buttons, all calendar downloads, personalisation, sharing, the save card, and QR scanning.

All paths are relative, so the site works from a GitHub Pages project subdirectory.
