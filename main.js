// ── Inject group styles ────────────────────────────────────────────────────────
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
 
 const USGS = 'https://planetarymaps.usgs.gov/cgi-bin/mapserv';
 const OPM = 'https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named';
 const S3 = 'https://s3.amazonaws.com/opmbuilder';
 const NASATREK = 'https://trek.nasa.gov/tiles/';
 
 // ── Groupes d'affichage ───────────────────────────────────────────────────────
 // L'ordre des ids détermine l'ordre d'apparition à l'intérieur du groupe.
 const GROUPS = [
  { label: 'Planètes telluriques', ids: ['mercury', 'venus', 'earth', 'mars'] },
  { label: 'Satellite naturel de la Terre', ids: ['moon'] },
  { label: 'Lunes de Mars', ids: ['phobos'] },
  { label: 'Lunes de Jupiter', ids: ['io', 'europa', 'ganymede', 'callisto'] },
  { label: 'Lunes de Saturne', ids: ['titan', 'mimas', 'enceladus', 'tethys', 'dione', 'rhea', 'iapetus', 'phoebe'] },
  { label: 'Planètes naines & petits corps', ids: ['ceres', 'vesta', 'bennu', 'ryugu'] },
 ];
 
 // Planet definitions //////////////////////////////////////////////////////////
 //
 // baseDefs → radio buttons (only one active at a time)
 // overlayDefs → checkboxes (can stack on top)
 //
 //////////////////////////////////////////////////////////////////////////////////
 
 const PLANETS = [
  // ── SYSTÈME SOLAIRE INTERNE ─────────────────────────────────────────────────
  {
  id: 'earth', name: 'TERRE', symbol: '', accent: '#4a9eff',
  maxZoom: 18, defaultZoom: 3,
  fact: 'Rayon : 6 371 km · g = 9.8 m/s² · 1 jour = 24 h',
  source: 'OpenStreetMap + Esri',
  baseDefs: [
  {
  label: 'Carte (OSM)',
  type: 'xyz',
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  opts: { subdomains:'abc', maxNativeZoom:19, maxZoom:19, attribution:'© OpenStreetMap' }
  },
  {
  label: 'Satellite (Esri)',
  type: 'xyz',
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  opts: { maxNativeZoom:19, maxZoom:19, attribution:'© Esri · NASA · NGA · USGS' }
  },
  ],
  overlayDefs: [
  {
  label: 'Labels (Esri)',
  type: 'xyz',
  url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
  opts: { maxNativeZoom:19, maxZoom:19, attribution:'© Esri', opacity:0.9 }
  }
  ],
  },
  {
  id: 'venus', name: 'VÉNUS', symbol: '', accent: '#e8c070',
  maxZoom: 6, defaultZoom: 2,
  fact: 'Rayon : 6 052 km · g = 8.9 m/s² · Rotation rétrograde · 1 jour = 243 j terriens',
  source: 'NASA Magellan · USGS',
  baseDefs: [
  {
  label: 'Magellan C3-MDIR Mosaic',
  type: 'xyz',
  url: `${NASATREK}Venus/EQ/Venus_Magellan_C3-MDIR_Global_Mosaic_2025m/1.0.0//default/default028mm/{z}/{y}/{x}.png`,
  opts: { maxNativeZoom:5, maxZoom:5, attribution:'NASA Magellan · USGS' }
  },
  ],
  overlayDefs: [
  {
    label: 'Nomenclature (USGS)',
    type: 'wms',
    url: `${USGS}?map=/maps/venus/venus_nomen_wms.map`,
    opts: { layers:'NOMENCLATURE', format:'image/png', version:'1.1.1', transparent:true, attribution:'USGS/IAU', opacity:0.85 }
  },
],
  },
  {
  id: 'mars', name: 'MARS', symbol: '', accent: '#ff6b35',
  maxZoom: 8, defaultZoom: 3,
  fact: 'Rayon : 3 390 km · g = 3.7 m/s² · 1 jour = 24 h 37 min',
  source: 'OpenPlanetaryMap',
  baseDefs: [
  {
  label: 'Viking MDIM21',
  type: 'xyz',
  url: `${NASATREK}Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg`,
  opts: { maxNativeZoom:7, maxZoom:7, attribution:'NASA Viking MDIM21 Mosaic' }
  }
  ],
  overlayDefs: [
  {
  label: 'Nomenclature (USGS)',
  type: 'wms',
  url: `${USGS}?map=/maps/mars/mars_nomen_wms.map`,
  opts: { layers:'NOMENCLATURE', format:'image/png', version:'1.1.1', transparent:true, attribution:'USGS/IAU', opacity:0.85 }
  }
  ],
  },
  {
  id: 'mercury', name: 'MERCURE', symbol: '', accent: '#c8a898',
  maxZoom: 6, defaultZoom: 2,
  fact: 'Rayon : 2 440 km · g = 3.7 m/s² · 1 jour = 59 j terriens',
  source: 'NASA MESSENGER · USGS',
  baseDefs: [
  {
  label: 'MESSENGER Enhanced Color',
  type: 'xyz',
  url: `${NASATREK}Mercury/EQ/Mercury_MESSENGER_MDIS_Basemap_EnhancedColor_Mosaic_Global_665m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg`,
  opts: { maxNativeZoom:7, maxZoom:7, attribution:'NASA MESSENGER · USGS' }
  },
  ],
  overlayDefs: [
  {
  label: 'Nomenclature (USGS)',
  type: 'wms',
  url: `${USGS}?map=/maps/mercury/mercury_nomen_wms.map`,
  opts: { layers:'NOMENCLATURE', format:'image/png', version:'1.1.1', transparent:true, attribution:'USGS/IAU', opacity:0.85 }
  }
  ],
  },
 
  // ── LUNE (TERRE) ─────────────────────────────────────────────────────────────
  {
  id: 'moon', name: 'LUNE', symbol: '', accent: '#d8d8c8',
  maxZoom: 7, defaultZoom: 3,
  fact: 'Rayon : 1 737 km · g = 1.6 m/s² · 1 jour = 29.5 j',
  source: 'OPM LOLA + LRO',
  baseDefs: [
  {
  label: 'LRO WAC Mosaic 303ppd',
  type: 'xyz',
  url: `${NASATREK}Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/default/default028mm/{z}/{y}/{x}.jpg`,
  opts: { maxNativeZoom:8, maxZoom:8, attribution:'NASA LRO WAC · USGS' }
  },
  ],
  overlayDefs: [
  // Moon USGS nomenclature WMS endpoint returns 0 layers — disabled
  ],
  },
 
  // ── LUNES DE MARS ────────────────────────────────────────────────────────────
  {
  id: 'phobos', name: 'PHOBOS', symbol: '', accent: '#9a8878',
  maxZoom: 5, defaultZoom: 2,
  fact: 'Rayon : 11 km · Lune de Mars · Orbite à 9 376 km · 1 jour = 7 h 39 min',
  source: 'NASA Viking · DLR · USGS',
  baseDefs: [
  {
  label: 'Viking Mosaic 40ppd',
  type: 'xyz',
  url: `${NASATREK}Phobos/EQ/Phobos_Viking_Mosaic_40ppd_DLRcontrol/1.0.0//default/default028mm/{z}/{y}/{x}.jpg`,
  opts: { maxNativeZoom:5, maxZoom:5, attribution:'NASA Viking · DLR · USGS' }
  },
  ],
  overlayDefs: [
  {
    label: 'Nomenclature (USGS)',
    type: 'wms',
    url: `${USGS}?map=/maps/mars/phobos_nomen_wms.map`,
    opts: { layers:'NOMENCLATURE', format:'image/png', version:'1.1.1', transparent:true, attribution:'USGS/IAU', opacity:0.85 }
  },
],
  },
 
  // ── LUNES DE JUPITER ─────────────────────────────────────────────────────────
  {
  id: 'io', name: 'IO', symbol: '', accent: '#d4b840',
  maxZoom: 5, defaultZoom: 2,
  fact: 'Rayon : 1 822 km · g = 1.8 m/s² · Lune de Jupiter · 300+ volcans actifs',
  source: 'NASA Galileo + Voyager · USGS',
  baseDefs: [
  {
  label: 'Galileo + Voyager Color Merge',
  type: 'xyz',
  url: `${NASATREK}Io/EQ/Io_GalileoSSI_Voyager_Global_Mosaic_ClrMerge_1km/1.0.0//default/default028mm/{z}/{y}/{x}.png`,
  opts: { maxNativeZoom:4, maxZoom:4, attribution:'NASA Galileo · Voyager · USGS' }
  },
  ],
  overlayDefs: [
  {
    label: 'Nomenclature (USGS)',
    type: 'wms',
    url: `${USGS}?map=/maps/jupiter/io_nomen_wms.map`,
    opts: { layers:'NOMENCLATURE', format:'image/png', version:'1.1.1', transparent:true, attribution:'USGS/IAU', opacity:0.85 }
  },
],
  },
  {
  id: 'europa', name: 'EUROPA', symbol: '', accent: '#a0c8e8',
  maxZoom: 5, defaultZoom: 2,
  fact: 'Rayon : 1 561 km · g = 1.3 m/s² · Lune de Jupiter · Océan sous-glaciaire',
  source: 'NASA Galileo · USGS',
  baseDefs: [
  {
  label: 'Galileo Global Map',
  type: 'xyz',
  url: `${NASATREK}Europa/EQ/20150218_europa_global_map_20000x10000/1.0.0//default/default028mm/{z}/{y}/{x}.png`,
  opts: { maxNativeZoom:5, maxZoom:5, attribution:'NASA Galileo · USGS' }
  },
  ],
  overlayDefs: [
  {
    label: 'Nomenclature (USGS)',
    type: 'wms',
    url: `${USGS}?map=/maps/jupiter/europa_nomen_wms.map`,
    opts: { layers:'NOMENCLATURE', format:'image/png', version:'1.1.1', transparent:true, attribution:'USGS/IAU', opacity:0.85 }
  },
],
  },
  {
  id: 'ganymede', name: 'GANYMÈDE', symbol: '', accent: '#a09080',
  maxZoom: 5, defaultZoom: 2,
  fact: 'Rayon : 2 634 km · g = 1.4 m/s² · Plus grande lune du système solaire',
  source: 'NASA Voyager + Galileo · USGS',
  baseDefs: [
  {
  label: 'Voyager + Galileo Mosaic 1km',
  type: 'xyz',
  url: `${NASATREK}Ganymede/EQ/Ganymede_Voyager_GalileoSSI_global_mosaic_1km/1.0.0//default/default028mm/{z}/{y}/{x}.png`,
  opts: { maxNativeZoom:5, maxZoom:5, attribution:'NASA Voyager · Galileo · USGS' }
  },
  ],
  overlayDefs: [
  {
    label: 'Nomenclature (USGS)',
    type: 'wms',
    url: `${USGS}?map=/maps/jupiter/ganymede_nomen_wms.map`,
    opts: { layers:'NOMENCLATURE', format:'image/png', version:'1.1.1', transparent:true, attribution:'USGS/IAU', opacity:0.85 }
  },
],
  },
  {
  id: 'callisto', name: 'CALLISTO', symbol: '', accent: '#787070',
  maxZoom: 5, defaultZoom: 2,
  fact: 'Rayon : 2 410 km · g = 1.2 m/s² · Lune de Jupiter · Surface la plus cratérisée',
  source: 'NASA Voyager + Galileo · USGS',
  baseDefs: [
  {
  label: 'Voyager + Galileo Mosaic 1km',
  type: 'xyz',
  url: `${NASATREK}Callisto/EQ/Callisto_Voyager_GalileoSSI_global_mosaic_1km/1.0.0//default/default028mm/{z}/{y}/{x}.png`,
  opts: { maxNativeZoom:5, maxZoom:5, attribution:'NASA Voyager · Galileo · USGS' }
  },
  ],
  overlayDefs: [
  {
    label: 'Nomenclature (USGS)',
    type: 'wms',
    url: `${USGS}?map=/maps/jupiter/callisto_nomen_wms.map`,
    opts: { layers:'NOMENCLATURE', format:'image/png', version:'1.1.1', transparent:true, attribution:'USGS/IAU', opacity:0.85 }
  },
],
  },
 
  // ── LUNES DE SATURNE ─────────────────────────────────────────────────────────
  {
  id: 'titan', name: 'TITAN', symbol: '', accent: '#d4a040',
  maxZoom: 5, defaultZoom: 2,
  fact: 'Rayon : 2 576 km · g = 1.4 m/s² · Lune de Saturne · Lacs de méthane liquide',
  source: 'NASA Cassini · USGS',
  baseDefs: [
  {
  label: 'Cassini ISS Color Ratio v2',
  type: 'xyz',
  url: `${NASATREK}Titan/EQ/Titan_global_32ppd_ColorRatio_v2/1.0.0/default/default028mm/{z}/{y}/{x}.png`,
  opts: { maxNativeZoom:4, maxZoom:4, attribution:'NASA Cassini · USGS' }
  },
  ],
  overlayDefs: [
  {
  label: 'Nomenclature (USGS)',
  type: 'wms',
  url: `${USGS}?map=/maps/saturn/titan_nomen_wms.map`,
  opts: { layers:'NOMENCLATURE', format:'image/png', version:'1.1.1', transparent:true, attribution:'USGS/IAU', opacity:0.85 }
  }
  ],
  },
  {
  id: 'mimas', name: 'MIMAS', symbol: '', accent: '#c0c8d0',
  maxZoom: 5, defaultZoom: 2,
  fact: 'Rayon : 198 km · g = 0.06 m/s² · Lune de Saturne · Ressemble à l\'Étoile de la Mort',
  source: 'NASA Cassini · DLR · USGS',
  baseDefs: [
  {
  label: 'Cassini DLR Basemap',
  type: 'xyz',
  url: `${NASATREK}Mimas/EQ/MI_170630_DLR_basemap/1.0.0//default/default028mm/{z}/{y}/{x}.jpg`,
  opts: { maxNativeZoom:4, maxZoom:4, attribution:'NASA Cassini · DLR · USGS' }
  },
  ],
  overlayDefs: [
  {
    label: 'Nomenclature (USGS)',
    type: 'wms',
    url: `${USGS}?map=/maps/saturn/mimas_nomen_wms.map`,
    opts: { layers:'NOMENCLATURE', format:'image/png', version:'1.1.1', transparent:true, attribution:'USGS/IAU', opacity:0.85 }
  },
],
  },
  {
  id: 'enceladus', name: 'ENCELADE', symbol: '', accent: '#d8eeff',
  maxZoom: 5, defaultZoom: 2,
  fact: 'Rayon : 252 km · g = 0.11 m/s² · Lune de Saturne · Geysers d\'eau glacée',
  source: 'NASA Cassini · USGS',
  baseDefs: [
  {
  label: 'Cassini ISS Global Mosaic 100m',
  type: 'xyz',
  url: `${NASATREK}Enceladus/EQ/Enceladus_Cassini_ISS_Global_Mosaic_100m_HPF/1.0.0/default/default028mm/{z}/{y}/{x}.png`,
  opts: { maxNativeZoom:5, maxZoom:5, attribution:'NASA Cassini · USGS' }
  },
  ],
  overlayDefs: [
  {
    label: 'Nomenclature (USGS)',
    type: 'wms',
    url: `${USGS}?map=/maps/saturn/enceladus_nomen_wms.map`,
    opts: { layers:'NOMENCLATURE', format:'image/png', version:'1.1.1', transparent:true, attribution:'USGS/IAU', opacity:0.85 }
  },
],
  },
  {
  id: 'tethys', name: 'TÉTHYS', symbol: '', accent: '#b0c0d8',
  maxZoom: 5, defaultZoom: 2,
  fact: 'Rayon : 531 km · g = 0.15 m/s² · Lune de Saturne · Grand canyon Ithaca Chasma',
  source: 'NASA Cassini · USGS',
  baseDefs: [
  {
  label: 'Cassini Global Mosaic 293m',
  type: 'xyz',
  url: `${NASATREK}Tethys/EQ/Tethys_Cassini_mosaic_global_293m/1.0.0//default/default028mm/{z}/{y}/{x}.jpg`,
  opts: { maxNativeZoom:4, maxZoom:4, attribution:'NASA Cassini · USGS' }
  },
  ],
  overlayDefs: [
  {
    label: 'Nomenclature (USGS)',
    type: 'wms',
    url: `${USGS}?map=/maps/saturn/tethys_nomen_wms.map`,
    opts: { layers:'NOMENCLATURE', format:'image/png', version:'1.1.1', transparent:true, attribution:'USGS/IAU', opacity:0.85 }
  },
],
  },
  {
  id: 'dione', name: 'DIONÉ', symbol: '', accent: '#c0b8b0',
  maxZoom: 5, defaultZoom: 2,
  fact: 'Rayon : 561 km · g = 0.23 m/s² · Lune de Saturne · Falaises de glace',
  source: 'NASA Cassini + Voyager · USGS',
  baseDefs: [
  {
  label: 'Cassini + Voyager Global 154m',
  type: 'xyz',
  url: `${NASATREK}Dione/EQ/Dione_Cassini_Voyageglobal_154m/1.0.0//default/default028mm/{z}/{y}/{x}.jpg`,
  opts: { maxNativeZoom:5, maxZoom:5, attribution:'NASA Cassini · Voyager · USGS' }
  },
  ],
  overlayDefs: [
  {
    label: 'Nomenclature (USGS)',
    type: 'wms',
    url: `${USGS}?map=/maps/saturn/dione_nomen_wms.map`,
    opts: { layers:'NOMENCLATURE', format:'image/png', version:'1.1.1', transparent:true, attribution:'USGS/IAU', opacity:0.85 }
  },
],
  },
  {
  id: 'rhea', name: 'RHÉA', symbol: '', accent: '#b8b0a8',
  maxZoom: 5, defaultZoom: 2,
  fact: 'Rayon : 764 km · g = 0.26 m/s² · Lune de Saturne · 2ᵉ plus grande lune de Saturne',
  source: 'NASA Cassini · DLR · USGS',
  baseDefs: [
  {
  label: ' Cassini DLR Basemap',
  type: 'xyz',
  url: `${NASATREK}Rhea/EQ/RH_120803_DLR_basemap/1.0.0//default/default028mm/{z}/{y}/{x}.jpg`,
  opts: { maxNativeZoom:4, maxZoom:4, attribution:'NASA Cassini · DLR · USGS' }
  },
  ],
  overlayDefs: [
  {
    label: 'Nomenclature (USGS)',
    type: 'wms',
    url: `${USGS}?map=/maps/saturn/rhea_nomen_wms.map`,
    opts: { layers:'NOMENCLATURE', format:'image/png', version:'1.1.1', transparent:true, attribution:'USGS/IAU', opacity:0.85 }
  },
],
  },
  {
  id: 'iapetus', name: 'JAPET', symbol: '', accent: '#988878',
  maxZoom: 5, defaultZoom: 2,
  fact: 'Rayon : 735 km · g = 0.22 m/s² · Lune de Saturne · Hémisphères noir et blanc',
  source: 'NASA Cassini + Voyager · USGS',
  baseDefs: [
  {
  label: ' Cassini + Voyager Mosaic 783m',
  type: 'xyz',
  url: `${NASATREK}Iapetus/EQ/Iapetus_Cassini_Voyager_mosaic_global_783m/1.0.0//default/default028mm/{z}/{y}/{x}.jpg`,
  opts: { maxNativeZoom:3, maxZoom:3, attribution:'NASA Cassini · Voyager · USGS' }
  },
  ],
  overlayDefs: [
  {
    label: 'Nomenclature (USGS)',
    type: 'wms',
    url: `${USGS}?map=/maps/saturn/iapetus_nomen_wms.map`,
    opts: { layers:'NOMENCLATURE', format:'image/png', version:'1.1.1', transparent:true, attribution:'USGS/IAU', opacity:0.85 }
  },
],
  },
  {
  id: 'phoebe', name: 'PHÉBÉ', symbol: '', accent: '#686060',
  maxZoom: 5, defaultZoom: 2,
  fact: 'Rayon : 107 km · g = 0.04 m/s² · Lune irrégulière de Saturne · Orbite rétrograde',
  source: 'NASA Cassini · DLR · USGS',
  baseDefs: [
  {
  label: 'Cassini DLR Basemap',
  type: 'xyz',
  url: `${NASATREK}Phoebe/EQ/PH_060315_DLR_basemap/1.0.0//default/default028mm/{z}/{y}/{x}.jpg`,
  opts: { maxNativeZoom:2, maxZoom:2, attribution:'NASA Cassini · DLR · USGS' }
  },
  ],
  overlayDefs: [
  {
    label: 'Nomenclature (USGS)',
    type: 'wms',
    url: `${USGS}?map=/maps/saturn/phoebe_nomen_wms.map`,
    opts: { layers:'NOMENCLATURE', format:'image/png', version:'1.1.1', transparent:true, attribution:'USGS/IAU', opacity:0.85 }
  },
],
  },
 
  // ── CEINTURE D'ASTÉROÏDES ────────────────────────────────────────────────────
  {
  id: 'ceres', name: 'CÉRÈS', symbol: '', accent: '#9090a0',
  maxZoom: 5, defaultZoom: 2,
  fact: 'Rayon : 473 km · g = 0.28 m/s² · Planète naine · Ceinture d\'astéroïdes',
  source: 'NASA Dawn · USGS',
  baseDefs: [
  {
  label: 'Dawn FC HAMO Color Shade',
  type: 'xyz',
  url: `${NASATREK}Ceres/EQ/Ceres_Dawn_FC_HAMO_ClrShade_DLR_Global_60ppd_Oct2016/1.0.0/default/default028mm/{z}/{y}/{x}.jpg`,
  opts: { maxNativeZoom:5, maxZoom:5, attribution:'NASA Dawn · USGS' }
  },
  ],
  overlayDefs: [
  {
  label: 'Nomenclature (USGS)',
  type: 'wms',
  url: `${USGS}?map=/maps/asteroid_belt/ceres_nomen_wms.map`,
  opts: { layers:'NOMENCLATURE', format:'image/png', version:'1.1.1', transparent:true, attribution:'USGS/IAU', opacity:0.85 }
  }
  ],
  },
  {
  id: 'vesta', name: 'VESTA', symbol: '', accent: '#808878',
  maxZoom: 5, defaultZoom: 2,
  fact: 'Rayon : 263 km · g = 0.25 m/s² · Protoplanète · Ceinture d\'astéroïdes',
  source: 'NASA Dawn · USGS',
  baseDefs: [
  {
  label: 'Dawn HAMO+LAMO Blend',
  type: 'xyz',
  url: `${NASATREK}Vesta/EQ/VestaHAMOLAMOBlend.eq/1.0.0//default/default028mm/{z}/{y}/{x}.png`,
  opts: { maxNativeZoom:7, maxZoom:7, attribution:'NASA Dawn · USGS' }
  },
  ],
  overlayDefs: [
  {
  label: 'Nomenclature (USGS)',
  type: 'wms',
  url: `${USGS}?map=/maps/asteroid_belt/vesta_nomen_wms.map`, // ← corrigé : USGS au lieu de NASATREK
  opts: { layers:'NOMENCLATURE', format:'image/png', version:'1.1.1', transparent:true, attribution:'USGS/IAU', opacity:0.85 }
  }
  ],
  },
  {
  id: 'bennu', name: 'BENNU', symbol: '', accent: '#706860',
  maxZoom: 4, defaultZoom: 2,
  fact: 'Rayon : 0.24 km · Astéroïde de type B · Orbite géocroiseur · Mission OSIRIS-REx',
  source: 'NASA OSIRIS-REx · USGS',
  baseDefs: [
  {
  label: 'OSIRIS-REx Global Mosaic',
  type: 'xyz',
  url: `${NASATREK}Bennu/EQ/Bennu_Global_Print_Mosaic_fix/1.0.0//default/default028mm/{z}/{y}/{x}.jpg`,
  opts: { maxNativeZoom:7, maxZoom:7, attribution:'NASA OSIRIS-REx · USGS' }
  },
  ],
  overlayDefs: [
  {
    label: 'Nomenclature (USGS)',
    type: 'wms',
    url: `${USGS}?map=/maps/asteroid_belt/bennu_nomen_wms.map`,
    opts: { layers:'NOMENCLATURE', format:'image/png', version:'1.1.1', transparent:true, attribution:'USGS/IAU', opacity:0.85 }
  },
],
  },
  {
  id: 'ryugu', name: 'RYUGU', symbol: '', accent: '#504840',
  maxZoom: 4, defaultZoom: 2,
  fact: 'Rayon : 0.45 km · Astéroïde de type Cq · Orbite géocroiseur · Mission Hayabusa2',
  source: 'JAXA Hayabusa2 · USGS',
  baseDefs: [
  {
  label: 'Hayabusa2 V-Band Global',
  type: 'xyz',
  url: `${NASATREK}Ryugu/EQ/ryugu_global_v_band/1.0.0//default/default028mm/{z}/{y}/{x}.jpg`,
  opts: { maxNativeZoom:4, maxZoom:4, attribution:'JAXA Hayabusa2 · USGS' }
  },
  ],
  overlayDefs: [
  {
    label: 'Nomenclature (USGS)',
    type: 'wms',
    url: `${USGS}?map=/maps/asteroid_belt/ryugu_nomen_wms.map`,
    opts: { layers:'NOMENCLATURE', format:'image/png', version:'1.1.1', transparent:true, attribution:'USGS/IAU', opacity:0.85 }
  },
],
  },
 ];
 
 // ── State ─────────────────────────────────────────────────────────────────────
 
 document.getElementById('planet-count').textContent = PLANETS.length;
 
 const mapInstances = {}; // id → Leaflet map
 const markerInstances = {}; // id → Leaflet marker
 const planetById = {}; // id → planet def (needed to rebuild layers in modal)
 PLANETS.forEach(p => planetById[p.id] = p);
 
 let sharedZoom = 3; // zoom level propagated to all maps
 let sharedCenter = [48.8566, 2.3522]; // lat/lng propagated to all maps
 let isSyncing = false; // re-entrancy guard for zoom+pan sync
 
 // ── Helpers ───────────────────────────────────────────────────────────────────
 
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
 
 // ── Feature 1 : zoom + pan synchronisés ──────────────────────────────────────
 
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
 
 // ── Feature 2 : modal grand écran ─────────────────────────────────────────────
 
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
 
 // ── Build grid ────────────────────────────────────────────────────────────────
 
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
 
  // ── Zoom + pan sync listeners (mini-maps only, not modal) ─────────────
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
 
 // ── Coordinate sync ───────────────────────────────────────────────────────────
 
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