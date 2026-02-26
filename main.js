import { PLANETS } from "./data/planets.js";
import { GROUPS } from "./data/groups.js";


// Inject group styles /////////////////////
(function() {
  const style = document.createElement('style');
  style.textContent = `
  #grid { display: block; }
  .group-section { margin-bottom: 40px; }
  .group-separator {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0 0 16px;
  color: #ffffff55;
  font-size: .65rem;
  letter-spacing: .2em;
  text-transform: uppercase;
  }
  .group-separator::before,
  .group-separator::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, #ffffff1a, transparent);
  }
  .group-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  }
  .planet-name:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
  }
  .planet-card {
  width: 340px;
  flex-shrink: 0;
  flex-grow: 0;
  }
  `;
  document.head.appendChild(style);
 })();
 
 const starsEl = document.getElementById('stars');
 for (let i = 0; i < 200; i++) {
  const s = document.createElement('div'); s.className = 'star';
  const sz = Math.random() * 2.5 + 0.5;
  s.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--d:${(Math.random()*4+2).toFixed(1)}s;animation-delay:${(Math.random()*4).toFixed(1)}s;opacity:${(Math.random()*.6+.1).toFixed(2)}`;
  starsEl.appendChild(s);
 }
 
 // Helper: build a Leaflet layer from a plain definition.
 //
 // Anti-black-tile contract (must hold for every baseDef opts):
 // maxNativeZoom = last zoom level the tile SERVER actually serves
 // maxZoom = MAP_MAX_ZOOM (28) → Leaflet upscales existing tiles
 // instead of fetching non-existent ones (→ 404 → black)
 //
 // Both values are set explicitly per baseDef in PLANETS; makeLayer just
 // enforces MAP_MAX_ZOOM on top so Leaflet is never told to stop rendering.
 const MAP_MAX_ZOOM = 28;
 function makeLayer(def) {
  if (def.type === 'wms') {
  // WMS: rendu server-side, maxZoom/maxNativeZoom ne s'appliquent pas.
  // On passe juste les params WMS bruts (layers, format, transparent…).
  const wmsOpts = { tileSize: 256, ...(def.opts || {}) };
  // Retirer les clés non-WMS qui pourraient polluer la requête
  delete wmsOpts.maxNativeZoom;
  return L.tileLayer.wms(def.url, wmsOpts);
  }
  // XYZ: on force maxZoom=28 pour l'upscaling au-delà du maxNativeZoom serveur
  const opts = { ...(def.opts || {}), maxZoom: MAP_MAX_ZOOM };
  return L.tileLayer(def.url, opts);
 }
 


 // State /////////////////////
 
 document.getElementById('planet-count').textContent = PLANETS.length;
 
 const mapInstances = {}; // id → Leaflet map
 const markerInstances = {}; // id → Leaflet marker
 const planetById = {}; // id → planet def (needed to rebuild layers in modal)
 PLANETS.forEach(p => planetById[p.id] = p);
 
 let sharedZoom = 3; // zoom level propagated to all maps
 let sharedCenter = [48.8566, 2.3522]; // lat/lng propagated to all maps
 let isSyncing = false; // re-entrancy guard for zoom+pan sync
 
 // Helpers /////////////////////
 
 function markerIcon(color) {
  return L.divIcon({
  className: '',
  html: `<div class="custom-marker" style="border-color:${color};background:${color}99;box-shadow:0 0 10px ${color}88;"></div>`,
  iconSize:[14,14], iconAnchor:[7,7]
  });
 }
 
 function setCoordsLabel(id, lat, lng) {
  const el = document.getElementById(`coords-${id}`);
  if (el) el.innerHTML = `${Math.abs(lat).toFixed(4)}°&nbsp;${lat>=0?'N':'S'}<br>${Math.abs(lng).toFixed(4)}°&nbsp;${lng>=0?'E':'O'}`;
 }
 
 /** Attach layers to a Leaflet map from a planet def. Returns { baseLayers, overlayLayers }. */
 function attachLayers(map, p) {
  const baseLayers = {}, overlayLayers = {};
  p.baseDefs.forEach((def, i) => {
  const layer = makeLayer(def);
  baseLayers[def.label] = layer;
  if (i === 0) layer.addTo(map);
  });
  p.overlayDefs.forEach(def => {
  const layer = makeLayer(def);
  overlayLayers[def.label] = layer;
  });
  const hasMultipleBases = Object.keys(baseLayers).length > 0;
  const hasOverlays = Object.keys(overlayLayers).length > 0;
  if (hasMultipleBases || hasOverlays) {
  L.control.layers(
  hasMultipleBases ? baseLayers : {},
  hasOverlays ? overlayLayers : {},
  { collapsed: true, position: 'bottomleft' }
  ).addTo(map);
  }
  return { baseLayers, overlayLayers };
 }
 
 //  Feature 1 : zoom + pan synchronisés /////////////////////
 
 /** Propagate zoom to every mini-map. Zoom is clamped per-planet native ceiling. */
 function syncZoomToAll(sourceId, newZoom) {
  if (isSyncing) return;
  isSyncing = true;
  sharedZoom = newZoom;
  PLANETS.forEach(p => {
  if (p.id === sourceId) return;
  const map = mapInstances[p.id];
  if (!map) return;
  // Clamp to the planet's native tile ceiling + upscale margin
  const clamped = Math.min(newZoom, p.maxZoom + 4);
  if (map.getZoom() !== clamped) map.setZoom(clamped, { animate: false });
  });
  isSyncing = false;
 }
 
 /** Propagate pan (center) to every mini-map. */
 function syncPanToAll(sourceId, latlng) {
  if (isSyncing) return;
  isSyncing = true;
  sharedCenter = [latlng.lat, latlng.lng];
  PLANETS.forEach(p => {
  if (p.id === sourceId) return;
  const map = mapInstances[p.id];
  if (!map) return;
  map.panTo(latlng, { animate: false });
  });
  isSyncing = false;
 }
 
 // Feature 2 : modal grand écran /////////////////////
 
 /** Build the modal DOM once and reuse it. */
 function ensureModal() {
  if (document.getElementById('planet-modal')) return;
 
  const modal = document.createElement('div');
  modal.id = 'planet-modal';
  modal.style.cssText = `
  display:none; position:fixed; inset:0; z-index:9999;
  background:rgba(0,0,0,.85); backdrop-filter:blur(6px);
  flex-direction:column; align-items:center; justify-content:center;`;
 
  modal.innerHTML = `
  <div id="modal-inner" style="
  position:relative; width:92vw; height:88vh; max-width:1400px;
  border-radius:12px; overflow:hidden;
  box-shadow:0 0 60px #0006, 0 0 0 1px #ffffff18;">
  <div id="modal-header" style="
  position:absolute; top:0; left:0; right:0; z-index:1000;
  display:flex; align-items:center; gap:12px;
  padding:10px 16px;
  background:linear-gradient(to bottom,#000c,#0000);
  pointer-events:none;">
   <div>
  <div id="modal-title" style="font-size:1.1rem;font-weight:700;color:#fff;letter-spacing:.12em"></div>
  <div id="modal-fact" style="font-size:.75rem;color:#aaa;margin-top:2px"></div>
  </div>
  <button id="modal-close" style="
  pointer-events:all; margin-left:auto;
  background:#ffffff18; border:1px solid #ffffff30; color:#fff;
  border-radius:8px; padding:6px 14px; cursor:pointer; font-size:.85rem;">
  Fermer
  </button>
  </div>
  <div id="modal-map" style="width:100%;height:100%;"></div>
  </div>`;
 
  document.body.appendChild(modal);
 
  // Close on backdrop click
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
 }
 
 let modalMap = null, modalMarker = null;
 
 function openModal(planetId) {
  ensureModal();
  const p = planetById[planetId];
  const src = mapInstances[planetId];
  if (!p || !src) return;
 
  // Fill header
  document.getElementById('modal-title').textContent = p.name;
  document.getElementById('modal-fact').textContent = p.fact;
  document.getElementById('planet-modal').style.setProperty('--accent', p.accent);
 
  const modal = document.getElementById('planet-modal');
  modal.style.display = 'flex';
 
  // Destroy previous modal map if any
  if (modalMap) { modalMap.remove(); modalMap = null; modalMarker = null; }
 
  // Create new Leaflet map inside modal, mirroring current mini-map state
  const center = src.getCenter();
  const zoom = Math.min(src.getZoom() + 1, p.maxZoom); // slightly more zoomed in
 
  modalMap = L.map('modal-map', {
  center, zoom,
  maxZoom: p.maxZoom,
  zoomControl: false,
  attributionControl: true,
  ...(p.id !== 'earth' && { crs: L.CRS.EPSG4326 })
  });
  
 
  attachLayers(modalMap, p);
 
  const lat = parseFloat(document.getElementById('lat').value) || center.lat;
  const lng = parseFloat(document.getElementById('lng').value) || center.lng;
  modalMarker = L.marker([lat, lng], { icon: markerIcon(p.accent) }).addTo(modalMap);
 }
 
 function closeModal() {
  const modal = document.getElementById('planet-modal');
  if (modal) modal.style.display = 'none';
  if (modalMap) { modalMap.remove(); modalMap = null; modalMarker = null; }
 }
 
 // Build grid /////////////////////
 
 function buildGrid() {
  const grid = document.getElementById('grid');
 
  // Iterate by group — each group gets a section wrapper + centered flex row
  GROUPS.forEach(group => {
  const section = document.createElement('div');
  section.className = 'group-section';
  const sep = document.createElement('div');
  sep.className = 'group-separator';
  sep.innerHTML = `<span>${group.label}</span>`;
  section.appendChild(sep);
  const cardsRow = document.createElement('div');
  cardsRow.className = 'group-cards';
  section.appendChild(cardsRow);
  grid.appendChild(section);
 
  group.ids.forEach(id => {
  const p = planetById[id];
  if (!p) return;
 
  const card = document.createElement('div');
  card.className = 'planet-card';
  card.style.setProperty('--accent', p.accent);
  card.innerHTML = `
  <div class="planet-header">
  <div>
  <div class="planet-name" data-id="${p.id}" title="Ouvrir en grand écran"
  style="cursor:pointer; user-select:none;">${p.name}</div>
  <div class="planet-source">${p.source}</div>
  </div>
  <div class="planet-coords-display" id="coords-${p.id}">—&nbsp;°&nbsp;N<br>—&nbsp;°&nbsp;E</div>
  </div>
  <div class="map-container" id="map-${p.id}"></div>
  <div class="planet-footer">${p.fact}</div>`;
  cardsRow.appendChild(card);
 
  // Click on name → fullscreen modal
  card.querySelector('.planet-name').addEventListener('click', () => openModal(p.id));
 
  setTimeout(() => {
  const lat = parseFloat(document.getElementById('lat').value) || 48.8566;
  const lng = parseFloat(document.getElementById('lng').value) || 2.3522;
 
  const map = L.map(`map-${p.id}`, {
  center: [lat, lng],
  zoom: Math.min(sharedZoom, p.maxZoom),
  maxZoom: MAP_MAX_ZOOM,
  zoomControl: false,
  attributionControl: true,
  ...(p.id !== 'earth' && { crs: L.CRS.EPSG4326 })
  });
 
  attachLayers(map, p);
 
  const marker = L.marker([lat, lng], { icon: markerIcon(p.accent) }).addTo(map);
  mapInstances[p.id] = map;
  markerInstances[p.id] = marker;
  setCoordsLabel(p.id, lat, lng);
 
  // Zoom + pan sync listeners (mini-maps only, not modal) /////////////////////
  map.on('zoomend', () => {
  if (!isSyncing) syncZoomToAll(p.id, map.getZoom());
  });
  map.on('moveend', () => {
  if (!isSyncing) syncPanToAll(p.id, map.getCenter());
  });
  }, 60);
  });
  });
 }
 
 // Coordinate sync /////////////////////
 
 function updateAllMaps() {
  const lat = parseFloat(document.getElementById('lat').value);
  const lng = parseFloat(document.getElementById('lng').value);
  if (isNaN(lat)||isNaN(lng)||lat<-90||lat>90||lng<-180||lng>180) {
  setStatus(' Coordonnées invalides — Latitude : ±90°, Longitude : ±180°', 'err'); return;
  }
  const lS = `${Math.abs(lat).toFixed(4)}° ${lat>=0?'N':'S'}`;
  const gS = `${Math.abs(lng).toFixed(4)}° ${lng>=0?'E':'O'}`;
  setStatus(` Position synchronisée sur ${PLANETS.length} mondes — ${lS}, ${gS}`, 'ok');
  PLANETS.forEach(p => {
  const map = mapInstances[p.id], mkr = markerInstances[p.id];
  if (map && mkr) { map.setView([lat, lng], map.getZoom()); mkr.setLatLng([lat, lng]); setCoordsLabel(p.id, lat, lng); }
  });
  // Sync marker in open modal too
  if (modalMap && modalMarker) modalMarker.setLatLng([lat, lng]);
 }
 
 function useGeolocation() {
  if (!navigator.geolocation) { setStatus('Géolocalisation non supportée', 'err'); return; }
  setStatus('Acquisition signal GPS...', 'loading');
  navigator.geolocation.getCurrentPosition(
  pos => {
  document.getElementById('lat').value = pos.coords.latitude.toFixed(6);
  document.getElementById('lng').value = pos.coords.longitude.toFixed(6);
  setStatus(`GPS acquis — Précision ±${Math.round(pos.coords.accuracy)} m`, 'ok');
  updateAllMaps();
  },
  err => {
  const m = { 1:'Permission refusée', 2:'Position indisponible', 3:'Délai expiré' };
  setStatus(`${m[err.code]||'Erreur GPS'}`, 'err');
  },
  { enableHighAccuracy:true, timeout:10000 }
  );
 }
 
 function setStatus(msg, type='') {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = 'status-bar' + (type?' '+type:'');
 }
 
 document.getElementById('lat').addEventListener('keydown', e=>{ if(e.key==='Enter') updateAllMaps(); });
 document.getElementById('lng').addEventListener('keydown', e=>{ if(e.key==='Enter') updateAllMaps(); });
 
 buildGrid();

window.useGeolocation = useGeolocation;
window.updateAllMaps = updateAllMaps;