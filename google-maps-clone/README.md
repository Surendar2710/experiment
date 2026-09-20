# Maps — a Google Maps UI clone

A front-end clone of the Google Maps web app's look, feel and core interactions —
search, place cards, turn-by-turn directions, layer switching, dark mode, and a
mobile bottom sheet — built with plain HTML/CSS/JS and [Leaflet](https://leafletjs.com/).

It is **not affiliated with or produced by Google**. It doesn't use the Google
Maps API, any Google branding/logo, or any Google map data — it's a from-scratch
recreation of the *interface patterns*, backed by free OpenStreetMap-based map
tiles, routing and geocoding services. Think of it as "what if Google Maps'
UI was rebuilt with open data."

Open `index.html` in a browser (or serve the folder — see [Running it](#running-it))
to try it live. It needs an internet connection at runtime for map tiles,
routing and geocoding, exactly like the real thing does.

## Feature tour → code map

Every piece of UI is backed by real, working logic — nothing here is a static
mockup. Screenshots below are followed by exactly where the code for that
piece lives.

| UI element | What it does | Where it lives |
|---|---|---|
| **Search box** (`⌘` icon, mic, clear button) | Filters the 8 demo places live as you type, by name/category | `js/app.js` → `renderResults()`, `matchesQuery()`; markup in `index.html` `.search-box` |
| **Category chips** (Restaurants, Hotels, Coffee…) | Filters markers + results list by category; toggle on/off | `js/app.js` → chip click listeners (`.chip[data-category]`) |
| **Results list** | Scrollable list of pins with star rating, review count, address | `js/app.js` → `renderResults()`; data in `js/places.js` |
| **Map markers** | Custom teardrop pins colored per category, built as inline SVG (no image sprites) | `js/icons.js` → `Icons.categoryDot()`; `js/app.js` → `buildMarkers()` |
| **Marker popup** | Mini card with rating + "Directions" shortcut, like Google's map popup | `js/app.js` → `popupHtml()` |
| **Place detail panel** | Full card: hero banner, rating, Save/Share/Send/Directions actions, hours, address, description | `index.html` `#placeDetail`; `js/app.js` → `selectPlace()` |
| **Directions panel** | Origin/destination fields, travel-mode tabs (car/walk/bike/transit), live route line, turn-by-turn steps, ETA | `index.html` `#directionsPanel`; `js/app.js` → `computeRoute()`, `renderRouteSummary()`, using [Leaflet Routing Machine](https://github.com/perliedman/leaflet-routing-machine) over the public OSRM instance at `routing.openstreetmap.de` |
| **Address search / geocoding** | Typing an address in origin/destination resolves it to coordinates | `js/app.js` → `geocode()`, using the [Nominatim](https://nominatim.org/) API |
| **Layers switcher** | Bottom-left thumbnail opens a panel to pick Default / Satellite / Terrain tiles, plus Dark mode and a demo Traffic toggle | `index.html` `#layersPanel`; `js/app.js` → `setBaseLayer()`; tile sources in `TILE_LAYERS` |
| **Dark mode** | Swaps both the map tiles (CARTO dark basemap) and the entire UI chrome to a dark palette | `js/app.js` → `#darkModeToggle` handler; CSS variables under `body.dark` in `css/style.css` |
| **"My location"** | Requests geolocation, drops a pulsing blue dot + accuracy circle, flies the map there | `js/app.js` → `#locateBtn` handler |
| **Zoom / compass controls** | Custom-styled floating buttons (Leaflet's own controls are hidden and replaced) | `css/style.css` `.map-controls`; `js/app.js` zoom/compass handlers |
| **Bottom info bar** | Live lat/lng + zoom level, OSM attribution, keyboard-shortcuts and terms links | `js/app.js` → `updateCoordsLabel()` |
| **Keyboard shortcuts modal** | `/` focuses search, `+`/`-` zoom, `Esc` closes panels — with a help dialog listing them | `js/app.js` → the `keydown` listener near the bottom; `#shortcutsModal` in `index.html` |
| **Responsive mobile layout** | Search bar + chips stay pinned to the top; results/place/directions become a draggable-feeling bottom sheet (peek ⇄ expanded), matching the real app's mobile pattern | `css/style.css` → `@media (max-width: 820px)` block; `js/app.js` → `showPanel()`'s `expand` option, `toggleSheet()` |

## File structure

```
google-maps-clone/
├── index.html                  All markup for the app shell (sidebar, map, modals)
├── css/
│   └── style.css               Every visual style — Google-Maps-style tokens
│                                (colors, shadows, radii) as CSS custom properties,
│                                plus the responsive/mobile bottom-sheet rules
├── js/
│   ├── icons.js                Hand-written inline-SVG icon set (search, pins,
│                                travel modes, stars, …) — zero icon-font/image
│                                dependency
│   ├── places.js                Demo dataset: 8 real NYC points of interest
│   │                            (name, category, rating, hours, coordinates…)
│   └── app.js                  All application logic: map setup, search/filter,
│                                place selection, routing, layers, geolocation,
│                                dark mode, keyboard shortcuts, mobile sheet
└── vendor/                     Leaflet + Leaflet Routing Machine, vendored
    ├── leaflet/                 locally (see "Why vendored" below)
    └── leaflet-routing-machine/
```

No build step, bundler, or framework — open `index.html` and it runs.

## Map data & services used

Since this isn't allowed to use the real (paid, API-keyed) Google Maps
Platform, it's built entirely on free, no-API-key services:

- **Map tiles** — [CARTO Voyager](https://carto.com/basemaps) (default,
  closest visually to Google's style) and dark basemap, [Esri World
  Imagery](https://www.esri.com/) (satellite), [OpenTopoMap](https://opentopomap.org/) (terrain)
- **Routing** — public [OSRM](http://project-osrm.org/) instances at
  `routing.openstreetmap.de` (separate car/bike/foot profiles)
- **Geocoding** — [Nominatim](https://nominatim.org/) (OpenStreetMap's search API)
- **Map data** — © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)

All of the above are free public services with usage limits meant for light,
non-commercial use — fine for demoing, not for production traffic.

## Why the libraries are vendored, not CDN-linked

`vendor/leaflet` and `vendor/leaflet-routing-machine` are commited copies of
the published npm packages (both permissively licensed — Leaflet is
BSD-2-Clause, Leaflet Routing Machine is ISC; see the `LICENSE`/`LICENSE.md`
files alongside them) rather than `<script src="https://unpkg.com/...">`
tags. That keeps the app fully self-contained: it doesn't break if a CDN is
blocked, rate-limited, or goes down, and it's what let this app be tested
end-to-end in a network-restricted environment during development.

## Running it

Any static file server works, e.g.:

```bash
cd google-maps-clone
python3 -m http.server 8080
# then open http://localhost:8080
```

or just double-click `index.html` (the app has no server-side code).

## Known limitations

- **Demo data only** — 8 hand-picked NYC places in `js/places.js`, not a real
  places database. Searching for anything else returns "No results found."
- **Transit directions** aren't available — the free OSRM routing backend
  used here only supports driving/cycling/walking; selecting the transit tab
  shows a message rather than pretending to route.
- **Save / Share / Send / Traffic toggle** are UI-only — they show a toast
  confirming the click but don't persist or send anything anywhere.
- Needs a live internet connection for tiles, routing and geocoding — there's
  no offline mode, same as the real Google Maps.
