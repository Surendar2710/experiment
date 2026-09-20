/* Inline SVG icon library — kept dependency-free so the app never fetches
   an icon font. Every function returns a ready-to-inject <svg> string. */
const Icons = (() => {
  const svg = (paths, viewBox = '0 0 24 24') =>
    `<svg viewBox="${viewBox}" fill="currentColor" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`;

  return {
    hamburger: svg('<path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z"/>'),
    search: svg('<path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.49 4.49 0 0 1 9.5 14z"/>'),
    mic: svg('<path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5.5a6.5 6.5 0 0 0 6 6.47V21h1v-3.53a6.5 6.5 0 0 0 6-6.47z"/>'),
    close: svg('<path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>'),
    back: svg('<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"/>'),
    star: svg('<path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>'),
    starHalf: svg('<path d="M12 15.4V6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28M12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24l-7.19-.61z"/>'),
    directions: svg('<path d="M21.71 11.29 12.71 2.29a1 1 0 0 0-1.42 0l-9 9a1 1 0 0 0 0 1.42l9 9a1 1 0 0 0 1.42 0l9-9a1 1 0 0 0 0-1.42zM14 14.5V12h-3v3H9v-4a1 1 0 0 1 1-1h4V7.5l3.5 3.5z"/>'),
    car: svg('<path d="M18.92 6.01A1 1 0 0 0 18 5H6a1 1 0 0 0-.92 1.01L4 12v8a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h10v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-8zM6.5 16A1.5 1.5 0 1 1 8 14.5 1.5 1.5 0 0 1 6.5 16zm11 0a1.5 1.5 0 1 1 1.5-1.5 1.5 1.5 0 0 1-1.5 1.5zM5.81 11 7 7h10l1.19 4z"/>'),
    walk: svg('<path d="M13.5 5.5a2 2 0 1 0-2-2 2 2 0 0 0 2 2zM9.8 8.9 7 23h2.1l1.8-8 2.1 2v6h2.1v-7.5l-2.1-2 .6-3A5.4 5.4 0 0 0 17.6 13l.6-2a3.7 3.7 0 0 1-3.9-2.9l-.6-1.5a2 2 0 0 0-2.3-1.4 2 2 0 0 0-.5.1L6 7.3V13h2V8.7z"/>'),
    bike: svg('<path d="M18.5 12.5a3.5 3.5 0 0 0-1.3.26L14.9 9.5H17V8h-4.3l-.9 1.5 1.9 3H10l-1.6-3.8A2 2 0 0 0 6.5 7.5 3.5 3.5 0 1 0 9.9 12h2.4l1.4 2.24a3.5 3.5 0 1 0 4.8-1.74zM5.5 14a2 2 0 1 1 1.9-2.7l.9 2.15A2 2 0 0 1 5.5 14zm13 0a2 2 0 0 1-1.8-1.14l1.1-2.06a2 2 0 1 1 .7 3.2z"/>'),
    transit: svg('<path d="M12 2c-4.42 0-8 .5-8 4v10.5A2.5 2.5 0 0 0 6.5 19L5 20.5v.5h2.23l2-2H15l2 2h2v-.5L17.5 19a2.5 2.5 0 0 0 2.5-2.5V6c0-3.5-3.58-4-8-4zM7.5 17A1.5 1.5 0 1 1 9 15.5 1.5 1.5 0 0 1 7.5 17zm9 0a1.5 1.5 0 1 1 1.5-1.5 1.5 1.5 0 0 1-1.5 1.5zM18 11H6V6h12z"/>'),
    locate: svg('<path d="M12 8a4 4 0 1 0 4 4 4 4 0 0 0-4-4zm8.94 3a9 9 0 0 0-7.94-7.94V1h-2v2.06A9 9 0 0 0 3.06 11H1v2h2.06a9 9 0 0 0 7.94 7.94V23h2v-2.06A9 9 0 0 0 20.94 13H23v-2zm-8.94 7a7 7 0 1 1 7-7 7 7 0 0 1-7 7z"/>'),
    layers: svg('<path d="m12 2-10 5 10 5 10-5zM2 12l10 5 10-5m-20 5 10 5 10-5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>'),
    plus: svg('<path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>'),
    minus: svg('<path d="M5 11H19V13H5V11Z"/>'),
    compass: svg('<path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm3.5 5.5-2 6-6 2 2-6zM12 13a1 1 0 1 1 1-1 1 1 0 0 1-1 1z"/>'),
    share: svg('<path d="M18 16.08a2.9 2.9 0 0 0-1.94.75l-7.05-4.11a3 3 0 0 0 0-1.44l6.96-4.06a3 3 0 1 0-.98-1.71l-6.96 4.06a3 3 0 1 0 0 4.86l7.05 4.11a2.92 2.92 0 1 0 2.92-2.46z"/>'),
    bookmark: svg('<path d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z"/>'),
    send: svg('<path d="M2 21 23 12 2 3v7l15 2-15 2z"/>'),
    phone: svg('<path d="M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-5 19a1.5 1.5 0 1 1 1.5-1.5A1.5 1.5 0 0 1 12 21zm5-4H7V5h10z"/>'),
    clock: svg('<path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 11H6v-2h5V6h2z"/>'),
    swap: svg('<path d="M7 7h11l-3.5-3.5L16 2l6 6-6 6-1.5-1.5L18 9H7zm10 10H6l3.5 3.5L8 22l-6-6 6-6 1.5 1.5L6 15h11z"/>'),
    pin: () => `<svg viewBox="0 0 36 46" width="34" height="44" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 0C8.06 0 0 8.06 0 18c0 12.6 18 28 18 28s18-15.4 18-28C36 8.06 27.94 0 18 0z" fill="#EA4335"/>
        <circle cx="18" cy="18" r="7.2" fill="#ffffff"/>
      </svg>`,
    categoryDot(color) {
      return `<svg viewBox="0 0 36 46" width="30" height="38" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 0C8.06 0 0 8.06 0 18c0 12.6 18 28 18 28s18-15.4 18-28C36 8.06 27.94 0 18 0z" fill="${color}"/>
        <circle cx="18" cy="17" r="8" fill="#ffffff"/>
      </svg>`;
    },
    blueDot: svg('<circle cx="12" cy="12" r="8" fill="#4285F4" stroke="#ffffff" stroke-width="2"/>'),
    category(name) {
      const glyphs = {
        restaurant: '<path d="M8 2v7a2 2 0 0 1-2 2v11H4V11a2 2 0 0 1-2-2V2h1.5v6H5V2h1.5v6H8V2zm7.5 0C13 2 11 5 11 8.5c0 2.5 1.3 4.1 3 4.8V22h1.5v-8.7c1.7-.7 3-2.3 3-4.8C18.5 5 16.5 2 15.5 2z"/>',
        cafe: '<path d="M4 3h13a3 3 0 0 1 0 6h-1a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zm13 2h-1v2h1a1 1 0 0 0 0-2zM3 19h15v2H3z"/>',
        park: '<path d="M12 2 6 10h3l-5 7h6v5h4v-5h6l-5-7h3z"/>',
        museum: '<path d="M12 2 2 8h20zM4 10v9H2v2h20v-2h-2v-9h-2v9h-3v-9h-2v9h-3v-9H8v9H6v-9z"/>',
        hotel: '<path d="M3 4h2v13H3zm18 6h-9V8a2 2 0 0 0-2-2H7v11h14zM7.5 11A1.5 1.5 0 1 1 6 12.5 1.5 1.5 0 0 1 7.5 11zM3 19h18v2H3z"/>',
        landmark: '<path d="M12 2 2 8h20zM4 10v8H2v2h20v-2h-2v-8h-2v8h-3v-8h-2v8h-3v-8H6v8H4v-8z"/>',
      };
      return svg(glyphs[name] || glyphs.landmark);
    },
  };
})();
