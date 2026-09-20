(() => {
  'use strict';

  /* ---------------------------------------------------------------- */
  /*  Constants & shared state                                        */
  /* ---------------------------------------------------------------- */

  const DEFAULT_CENTER = [40.7549, -73.9840]; // Midtown Manhattan
  const DEFAULT_ZOOM = 13;

  const TILE_LAYERS = {
    roadmap: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
    }),
    dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
    }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
      maxZoom: 19,
    }),
    terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors, SRTM &copy; OpenTopoMap',
      subdomains: 'abc',
      maxZoom: 17,
    }),
  };

  // `server` selects the routing.openstreetmap.de backend (routed-car/-bike/-foot);
  // `apiProfile` is the OSRM URL segment each of those backends expects.
  const ROUTE_PROFILES = {
    car: { server: 'car', apiProfile: 'driving', label: 'Driving' },
    walk: { server: 'foot', apiProfile: 'foot', label: 'Walking' },
    bike: { server: 'bike', apiProfile: 'bike', label: 'Cycling' },
  };

  const state = {
    darkMode: false,
    baseLayerKey: 'roadmap',
    activeCategory: 'all',
    selectedPlace: null,
    userLatLng: null,
    routingControl: null,
    directionsMode: 'car',
  };

  /* ---------------------------------------------------------------- */
  /*  DOM helpers                                                      */
  /* ---------------------------------------------------------------- */

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function setIcon(el, svgMarkup) {
    if (el) el.innerHTML = svgMarkup;
  }

  function isMobile() { return window.matchMedia('(max-width: 820px)').matches; }

  function showPanel(name, { expand = true } = {}) {
    $('#resultsPanel').hidden = name !== 'results';
    $('#placeDetail').hidden = name !== 'detail';
    $('#directionsPanel').hidden = name !== 'directions';
    if (expand && isMobile()) $('#sidebar').classList.add('open');
  }

  function showToast(message, ms = 2400) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { toast.hidden = true; }, ms);
  }

  function starRow(rating) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    let html = '';
    for (let i = 0; i < full; i++) html += Icons.star;
    if (half) html += Icons.starHalf;
    return html;
  }

  function formatReviews(n) {
    return n >= 1000 ? `(${(n / 1000).toFixed(1)}k)` : `(${n})`;
  }

  /* ---------------------------------------------------------------- */
  /*  Map init                                                         */
  /* ---------------------------------------------------------------- */

  const map = L.map('map', {
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    zoomControl: false,
    attributionControl: false,
  });
  TILE_LAYERS.roadmap.addTo(map);

  const markerLayer = L.layerGroup().addTo(map);
  const markersById = {};

  function pinDivIcon(place, selected) {
    return L.divIcon({
      className: `place-marker${selected ? ' selected' : ''}`,
      html: Icons.categoryDot(place.color),
      iconSize: [30, 38],
      iconAnchor: [15, 38],
      popupAnchor: [0, -34],
    });
  }

  function buildMarkers(list) {
    markerLayer.clearLayers();
    list.forEach((place) => {
      const marker = L.marker([place.lat, place.lng], { icon: pinDivIcon(place, false) });
      marker.on('click', () => selectPlace(place, { flyTo: false }));
      marker.bindPopup(popupHtml(place), { closeButton: true, offset: [0, -4] });
      marker.addTo(markerLayer);
      markersById[place.id] = marker;
    });
  }

  function popupHtml(place) {
    return `
      <div class="map-popup">
        <h3>${place.name}</h3>
        <div class="popup-meta">
          <span>${place.rating}</span>
          <span class="stars">${starRow(place.rating)}</span>
          <span>${formatReviews(place.reviews)}</span>
        </div>
        <button type="button" data-directions-for="${place.id}">${Icons.directions} Directions</button>
      </div>`;
  }

  map.getContainer().addEventListener('click', (e) => {
    const btn = e.target.closest('[data-directions-for]');
    if (!btn) return;
    const place = PLACES.find((p) => p.id === btn.dataset.directionsFor);
    if (place) openDirections(place);
  });

  /* ---------------------------------------------------------------- */
  /*  Results list / search / filters                                  */
  /* ---------------------------------------------------------------- */

  function matchesQuery(place, query) {
    if (!query) return true;
    const q = query.toLowerCase();
    return place.name.toLowerCase().includes(q) ||
      place.category.toLowerCase().includes(q) ||
      place.categoryLabel.toLowerCase().includes(q);
  }

  function renderResults() {
    const query = $('#searchInput').value.trim();
    const filtered = PLACES.filter((p) =>
      (state.activeCategory === 'all' || p.category === state.activeCategory) &&
      matchesQuery(p, query)
    );

    buildMarkers(filtered);

    const list = $('#resultsList');
    list.innerHTML = '';
    if (!filtered.length) {
      list.innerHTML = '<li class="panel-hint">No results found.</li>';
      return;
    }
    filtered.forEach((place) => {
      const li = document.createElement('li');
      li.className = 'result-item';
      li.innerHTML = `
        <span class="result-pin">${Icons.categoryDot(place.color)}</span>
        <div class="result-info">
          <div class="result-name">${place.name}</div>
          <div class="result-meta">
            <span>${place.rating}</span>
            <span class="stars">${starRow(place.rating)}</span>
            <span>${formatReviews(place.reviews)}</span>
          </div>
          <div class="result-meta">${place.categoryLabel} &middot; ${place.address}</div>
        </div>`;
      li.addEventListener('click', () => selectPlace(place, { flyTo: true }));
      list.appendChild(li);
    });
  }

  $('#searchInput').addEventListener('input', () => {
    $('#clearSearchBtn').hidden = !$('#searchInput').value;
    showPanel('results');
    renderResults();
  });

  $('#clearSearchBtn').addEventListener('click', () => {
    $('#searchInput').value = '';
    $('#clearSearchBtn').hidden = true;
    renderResults();
    $('#searchInput').focus();
  });

  $$('.chip[data-category]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const isSame = chip.classList.contains('active');
      $$('.chip').forEach((c) => c.classList.remove('active'));
      if (isSame) {
        state.activeCategory = 'all';
      } else {
        chip.classList.add('active');
        state.activeCategory = chip.dataset.category;
      }
      showPanel('results');
      renderResults();
    });
  });

  $('.chip[data-filter="all"]').addEventListener('click', () => {
    state.activeCategory = 'all';
    $$('.chip').forEach((c) => c.classList.remove('active'));
    $('.chip[data-filter="all"]').classList.add('active');
    renderResults();
  });
  $('.chip[data-filter="all"]').classList.add('active');

  /* ---------------------------------------------------------------- */
  /*  Place detail panel                                               */
  /* ---------------------------------------------------------------- */

  function selectPlace(place, { flyTo }) {
    state.selectedPlace = place;

    Object.values(markersById).forEach((m) => m.getElement()?.classList.remove('selected'));
    const marker = markersById[place.id];
    if (marker) {
      marker.getElement()?.classList.add('selected');
      marker.openPopup();
    }

    if (flyTo !== false) map.flyTo([place.lat, place.lng], 16, { duration: 0.6 });

    $('#placeHero').style.setProperty('--place-color', place.color);
    $('#placeHero').innerHTML = Icons.category(place.category);
    $('#placeName').textContent = place.name;
    $('#placeRatingNum').textContent = place.rating.toFixed(1);
    $('#placeStars').innerHTML = starRow(place.rating);
    $('#placeReviews').textContent = `${place.reviews.toLocaleString()} reviews`;
    $('#placeCategory').textContent = place.categoryLabel;
    $('#placeAddress').textContent = place.address;
    $('#placeHours').textContent = place.hours;
    $('#placeBlurb').textContent = place.blurb;

    showPanel('detail');
  }

  $('#detailBackBtn').addEventListener('click', () => {
    showPanel('results');
    renderResults();
  });

  $('#directionsBtn').addEventListener('click', () => {
    if (state.selectedPlace) openDirections(state.selectedPlace);
  });

  $$('.action-btn:not(.primary)').forEach((btn) => {
    btn.addEventListener('click', () => {
      const label = btn.textContent.trim();
      showToast(`${label} is a UI demo in this clone.`);
    });
  });

  /* ---------------------------------------------------------------- */
  /*  Directions panel & routing                                       */
  /* ---------------------------------------------------------------- */

  function openDirections(place) {
    $('#destinationInput').value = place.name;
    if (!$('#originInput').value.trim()) $('#originInput').value = 'Your location';
    showPanel('directions');
    computeRoute();
  }

  $('#directionsBackBtn').addEventListener('click', () => {
    clearRoute();
    showPanel('results');
    renderResults();
  });

  $('#swapBtn').addEventListener('click', () => {
    const o = $('#originInput');
    const d = $('#destinationInput');
    const tmp = o.value; o.value = d.value; d.value = tmp;
    computeRoute();
  });

  $$('.mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.mode-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.directionsMode = btn.dataset.mode;
      computeRoute();
    });
  });

  ['originInput', 'destinationInput'].forEach((id) => {
    $('#' + id).addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); computeRoute(); }
    });
    $('#' + id).addEventListener('blur', () => computeRoute());
  });

  async function geocode(text) {
    if (!text || text.trim().toLowerCase() === 'your location') {
      return state.userLatLng || L.latLng(...DEFAULT_CENTER);
    }
    const known = PLACES.find((p) => p.name.toLowerCase() === text.trim().toLowerCase());
    if (known) return L.latLng(known.lat, known.lng);

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(text)}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const data = await res.json();
      if (data && data[0]) return L.latLng(parseFloat(data[0].lat), parseFloat(data[0].lon));
    } catch (err) {
      /* network/geocoding failure falls through to null below */
    }
    return null;
  }

  function clearRoute() {
    if (state.routingControl) {
      map.removeControl(state.routingControl);
      state.routingControl = null;
    }
    $('#routeSummary').hidden = true;
    $('#routeError').hidden = true;
    $('#routeSteps').innerHTML = '';
  }

  async function computeRoute() {
    const originText = $('#originInput').value;
    const destText = $('#destinationInput').value;
    if (!destText.trim()) { clearRoute(); return; }

    if (state.directionsMode === 'transit') {
      clearRoute();
      $('#routeError').hidden = false;
      $('#routeError').textContent = 'Transit directions aren’t available in this demo — try driving, walking or cycling.';
      return;
    }

    const [originLatLng, destLatLng] = await Promise.all([geocode(originText), geocode(destText)]);
    if (!originLatLng || !destLatLng) {
      clearRoute();
      $('#routeError').hidden = false;
      $('#routeError').textContent = 'Could not find that location. Try a different search.';
      return;
    }

    const { server, apiProfile } = ROUTE_PROFILES[state.directionsMode];
    if (state.routingControl) map.removeControl(state.routingControl);

    state.routingControl = L.Routing.control({
      waypoints: [originLatLng, destLatLng],
      router: L.Routing.osrmv1({
        serviceUrl: `https://routing.openstreetmap.de/routed-${server}/route/v1`,
        profile: apiProfile,
      }),
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      createMarker: (i, wp) => L.marker(wp.latLng, {
        icon: i === 0
          ? L.divIcon({ className: 'user-marker', html: Icons.blueDot, iconSize: [20, 20], iconAnchor: [10, 10] })
          : L.divIcon({ className: 'place-marker', html: Icons.pin(), iconSize: [34, 44], iconAnchor: [17, 44] }),
      }),
      lineOptions: { styles: [{ color: '#4285F4', opacity: 0.95, weight: 6 }] },
    }).addTo(map);

    state.routingControl.on('routesfound', (e) => {
      const route = e.routes[0];
      renderRouteSummary(route);
    });
    state.routingControl.on('routingerror', () => {
      $('#routeSummary').hidden = true;
      $('#routeSteps').innerHTML = '';
      $('#routeError').hidden = false;
      $('#routeError').textContent = 'Could not calculate a route between these points.';
    });
  }

  function renderRouteSummary(route) {
    $('#routeError').hidden = true;
    const km = (route.summary.totalDistance / 1000);
    const distance = km < 1 ? `${Math.round(route.summary.totalDistance)} m` : `${km.toFixed(1)} km`;
    const mins = Math.round(route.summary.totalTime / 60);
    const time = mins >= 60 ? `${Math.floor(mins / 60)} hr ${mins % 60} min` : `${mins} min`;

    const summary = $('#routeSummary');
    summary.hidden = false;
    summary.innerHTML = `<b>${time}</b> &nbsp;<span class="muted">(${distance}) · ${ROUTE_PROFILES[state.directionsMode].label}</span>`;

    const steps = $('#routeSteps');
    steps.innerHTML = '';
    (route.instructions || []).forEach((instr, i) => {
      const li = document.createElement('li');
      const d = instr.distance >= 1000 ? `${(instr.distance / 1000).toFixed(1)} km` : `${Math.round(instr.distance)} m`;
      li.innerHTML = `<span class="step-idx">${i + 1}</span><span>${instr.text} <span class="muted">— ${d}</span></span>`;
      steps.appendChild(li);
    });
  }

  /* ---------------------------------------------------------------- */
  /*  Map controls: zoom / locate / compass                            */
  /* ---------------------------------------------------------------- */

  $('#zoomInBtn').addEventListener('click', () => map.zoomIn());
  $('#zoomOutBtn').addEventListener('click', () => map.zoomOut());
  $('#compassBtn').addEventListener('click', () => map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM));

  let userMarker = null;
  let accuracyCircle = null;

  $('#locateBtn').addEventListener('click', () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
        state.userLatLng = latlng;
        if (!userMarker) {
          userMarker = L.marker(latlng, {
            icon: L.divIcon({ className: 'user-marker', html: Icons.blueDot, iconSize: [20, 20], iconAnchor: [10, 10] }),
            zIndexOffset: 1000,
          }).addTo(map);
          accuracyCircle = L.circle(latlng, { radius: pos.coords.accuracy, color: '#4285F4', fillColor: '#4285F4', fillOpacity: 0.15, weight: 1 }).addTo(map);
        } else {
          userMarker.setLatLng(latlng);
          accuracyCircle.setLatLng(latlng).setRadius(pos.coords.accuracy);
        }
        map.flyTo(latlng, 15);
      },
      () => showToast('Location unavailable — check browser permissions.'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });

  /* ---------------------------------------------------------------- */
  /*  Layers panel                                                     */
  /* ---------------------------------------------------------------- */

  $('#layersPanelToggle').addEventListener('click', (e) => {
    e.stopPropagation();
    $('#layersPanel').hidden = !$('#layersPanel').hidden;
  });
  document.addEventListener('click', (e) => {
    const panel = $('#layersPanel');
    if (!panel.hidden && !panel.contains(e.target) && e.target !== $('#layersPanelToggle')) {
      panel.hidden = true;
    }
  });

  function setBaseLayer(key) {
    Object.values(TILE_LAYERS).forEach((layer) => map.removeLayer(layer));
    const activeKey = (key === 'roadmap' && state.darkMode) ? 'dark' : key;
    TILE_LAYERS[activeKey].addTo(map);
    state.baseLayerKey = key;
    $('#layersPanelToggle .layers-thumb').className = `layers-thumb ${key}-thumb`;
  }

  $$('.layer-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.layer-option').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      setBaseLayer(btn.dataset.layer);
    });
  });

  $('#darkModeToggle').addEventListener('click', () => {
    state.darkMode = !state.darkMode;
    document.body.classList.toggle('dark', state.darkMode);
    $('#darkSwitch').classList.toggle('on', state.darkMode);
    setBaseLayer(state.baseLayerKey);
  });

  $('#trafficToggle').addEventListener('click', () => {
    const sw = $('#trafficSwitch');
    sw.classList.toggle('on');
    showToast(sw.classList.contains('on')
      ? 'Traffic layer enabled (visual demo only).'
      : 'Traffic layer disabled.');
  });

  /* ---------------------------------------------------------------- */
  /*  Bottom bar: live coordinates                                     */
  /* ---------------------------------------------------------------- */

  function updateCoordsLabel(latlng) {
    $('#coordsLabel').textContent = `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)} · z${map.getZoom()}`;
  }
  map.on('mousemove', (e) => updateCoordsLabel(e.latlng));
  map.on('moveend', () => updateCoordsLabel(map.getCenter()));
  updateCoordsLabel(map.getCenter());

  /* ---------------------------------------------------------------- */
  /*  Keyboard shortcuts modal                                         */
  /* ---------------------------------------------------------------- */

  $('#keyboardShortcutsLink').addEventListener('click', (e) => {
    e.preventDefault();
    $('#shortcutsModal').hidden = false;
  });
  $('#closeShortcutsBtn').addEventListener('click', () => { $('#shortcutsModal').hidden = true; });
  $('#shortcutsModal').addEventListener('click', (e) => {
    if (e.target.id === 'shortcutsModal') $('#shortcutsModal').hidden = true;
  });
  $('#termsLink').addEventListener('click', (e) => {
    e.preventDefault();
    showToast('This is a demo project — no real terms of service apply.');
  });

  document.addEventListener('keydown', (e) => {
    const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
    if (e.key === 'Escape') {
      $('#shortcutsModal').hidden = true;
      $('#layersPanel').hidden = true;
      if (typing) document.activeElement.blur();
    } else if (typing) {
      return;
    } else if (e.key === '/') {
      e.preventDefault();
      $('#searchInput').focus();
    } else if (e.key === '+' || e.key === '=') {
      map.zoomIn();
    } else if (e.key === '-') {
      map.zoomOut();
    }
  });

  /* ---------------------------------------------------------------- */
  /*  Mobile bottom sheet (results/detail/directions panel)            */
  /* ---------------------------------------------------------------- */

  function toggleSheet() {
    if (!isMobile()) return;
    $('#sidebar').classList.toggle('open');
  }

  $('#menuBtn').addEventListener('click', toggleSheet);
  $('#sheetHandle').addEventListener('click', toggleSheet);

  /* ---------------------------------------------------------------- */
  /*  Icon injection                                                   */
  /* ---------------------------------------------------------------- */

  setIcon($('#menuBtn'), Icons.hamburger);
  setIcon($('.search-box-icon'), Icons.search);
  setIcon($('.search-box-mic'), Icons.mic);
  setIcon($('#clearSearchBtn'), Icons.close);
  setIcon($('#detailBackBtn'), Icons.back);
  setIcon($('#directionsBackBtn'), Icons.back);
  setIcon($('#swapBtn'), Icons.swap);
  setIcon($('#closeShortcutsBtn'), Icons.close);
  setIcon($('#locateBtn'), Icons.locate);
  setIcon($('#zoomInBtn'), Icons.plus);
  setIcon($('#zoomOutBtn'), Icons.minus);
  setIcon($('#compassBtn'), Icons.compass);
  setIcon($('.mode-btn[data-mode="car"]'), Icons.car);
  setIcon($('.mode-btn[data-mode="walk"]'), Icons.walk);
  setIcon($('.mode-btn[data-mode="bike"]'), Icons.bike);
  setIcon($('.mode-btn[data-mode="transit"]'), Icons.transit);
  $$('[data-icon]').forEach((el) => setIcon(el, Icons[el.dataset.icon]));

  /* ---------------------------------------------------------------- */
  /*  Initial render                                                   */
  /* ---------------------------------------------------------------- */

  renderResults();
  showPanel('results', { expand: false });
})();
