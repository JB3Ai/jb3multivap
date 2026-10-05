# Multivaps dealership portal demo

Open `index.html` in a modern browser. There are no dependencies or build steps.
For a local HTTP preview, run `python -m http.server 8080 --bind 127.0.0.1` in this directory and visit http://localhost:8080.

- `index.html`: semantic page sections, SVG icons, accessible native dialogs.
- `styles.css`: design tokens, card variants, responsive layouts and reduced-motion support.
- `app.js`: ten-product catalog, PDF links and simulated inquiry flow.
- `design/dashboard-concept.png`: visual reference.

The vehicle details, dealership address, login indicator, odometer gauge and policy state are illustrative. The supplied HTML scaffold's vehicle details are used: Toyota Hilux 2.8 GD-6 RB Legend, 48,500 km, year 2023, VIN AHTK123456789X, registration JHB 884 GP. The user-supplied ten-product matrix enables four products: Supreme Drive Plus is active until 14 November 2027; Service Plan, Prime Drive Plus and Monthly Warranty are available. The six disabled products remain in the catalog. The display filter includes products with `activeForDealer || userHasActive`, preserving owned policies even when dealer availability changes.

Download buttons retrieve the supplied original policy wording PDFs; they do not generate personalized policies. All displayed products have a document preview and a simulated callback inquiry. Keep all ten PDFs alongside `index.html` with their existing filenames.

The fixed-position effect of the sticky demo banner persists during scrolling. The welcome dialog is dismissed for the current browser session. The seven-day statement is a preview notice; this static site has no server-side access expiration. Inquiry details are neither stored nor transmitted.

To integrate real data, replace the catalog and mock summary values, supply personalized document URLs, and connect the inquiry form to an authorized backend. Refresh gauges from actual plan data and enforce any expiration server-side.
