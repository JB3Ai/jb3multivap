# Multivaps dealership portal demo

For a local HTTP preview, run `python -m http.server 8080 --bind 127.0.0.1` in this directory and visit http://localhost:8080. A local HTTP server or static host is required for fetching PDFs; `file://` can display the dashboard but cannot generate branded PDFs.
There are no build steps. The pinned pdf-lib 1.17.1 browser bundle and MIT license are included in `vendor/`, so no CDN connection is needed at runtime.

- `index.html`: semantic page sections, SVG icons, accessible native dialogs.
- `styles.css`: design tokens, card variants, responsive layouts and reduced-motion support.
- `app.js`: ten-product catalog, PDF links and simulated inquiry flow.
- `design/dashboard-concept.png`: visual reference.

The supplied `Qwen_html_20261005_1b7bvzlir.html` is retained as the landing-animation reference. Its gear and Multivap Solutions wordmark animation are integrated into a scoped, responsive intro dialog. On the first visit of a browser session, the intro plays for about five seconds, then opens the existing demo notice. **Enter portal** or Escape skips it; **Replay intro** in the footer replays it for presentations. Reduced-motion users enter the portal without animation. The seven-day demo statement remains visible during the intro. No new animation library is required.

The vehicle details, dealership addresses, login indicators, odometer gauges and policy states are illustrative. Use the demo persona toolbar to switch dashboards:

| Persona | Dealer / vehicle | Enabled products | Registered policy |
| --- | --- | --- | --- |
| Alex Morgan, +27 82 555 0148 | Toyota Johannesburg / Hilux 2.8 GD-6 RB Legend | Supreme, Service, Prime, Monthly (4) | Supreme Drive Plus, expires 14 November 2027 |
| Sarah Jenkins, +27 84 912 3001 | BMW Sandton / X5 xDrive30d M Sport | Elite Warranty Plus, Service, Tyre & Rim, GAP, Body & Interior, Monthly (6) | Elite Warranty Plus, expires 20 March 2028 |
| Johan van der Merwe, +27 83 401 8892 | Mercedes-Benz Cape Town / C200 AMG Line | Prime, Service, Tyre & Rim (3) | Prime Drive Plus, expired 10 August 2026 |

`masterCatalog` defines all ten products. `demoPersonas` defines each client's identity, vehicle, dealer accent, registered cover and enabled product IDs. Only enabled or owned products appear. An owned policy remains visible if its dealer later disables the product. Expiry is compared with today's South African calendar date; expired cover stays in Registered Policies with an expired badge, 0% health and an expired coverage gauge.

The **Admin Overview Console** derives its counters, policy statuses and three table rows from this data. The initial totals are 3 clients, 3 dealerships, 10 catalog products and 13 listed product assignments (4 + 6 + 3). Expand a matrix count to inspect the enabled products, or use **View Client Dashboard** to return to that persona. On mobile the table scrolls horizontally within its own region. Stats refresh when entering/refocusing admin; they are local demo data, not a live backend feed. The switcher is a presentation aid, not authentication or secure tenant isolation.

The active policy's **View Custom PDF** action downloads a dealership-branded copy. **View PDF Brochure** in a product modal opens a branded copy in a new tab; if a popup is blocked or closed, it downloads instead. Both fetch the selected base PDF, add the demo dealership header in memory with pdf-lib, and keep original files unchanged. All displayed products have a document preview and a simulated callback inquiry. Keep all ten PDFs alongside `index.html` with their existing filenames.

The first page gains an 80-point band above the original page boundary (its height increases); existing page content is not scaled, moved, or covered. Other pages keep their original dimensions. The banner uses the portal monogram, dealer name, address, support number, agent label, brand accent and **DEMO PREVIEW** notice. This adds dealership branding, not personalized insurance terms. No official dealership logos were supplied; add a `logoUrl` pointing to an authorized same-origin PNG/JPEG to each profile in `demoPersonas` if desired. An optional profile `agent` sets the contact label. `brandingFor()` derives the PDF identity from the selected persona. Each generation snapshots that identity, so switching personas during a download cannot change its branding. Unsupported Helvetica characters are replaced with `?`; long lines fit within the header.

Generation has a busy state, request/error feedback, retryable controls and object URL cleanup. No document or customer information is sent to an external service. The supplied unrotated, uncropped PDFs are supported; unexpected rotation/cropping reports an error rather than obscuring content.

The fixed-position effect of the sticky demo banner persists during scrolling. The welcome dialog is dismissed for the current browser session. The seven-day statement is a preview notice; this static site has no server-side access expiration. Inquiry details are neither stored nor transmitted.

To integrate real data, replace the catalog and mock summary values, supply personalized document URLs, and connect the inquiry form to an authorized backend. Refresh gauges from actual plan data and enforce any expiration server-side.
