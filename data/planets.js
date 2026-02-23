  // Planet definitions //////////////////////////////////////////////////////////
 //
 // baseDefs → radio buttons (only one active at a time)
 // overlayDefs → checkboxes (can stack on top)
 //
 //////////////////////////////////////////////////////////////////////////////////

 const USGS = 'https://planetarymaps.usgs.gov/cgi-bin/mapserv';
 const OPM = 'https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named';
 const S3 = 'https://s3.amazonaws.com/opmbuilder';
 const NASATREK = 'https://trek.nasa.gov/tiles/';

 export const PLANETS = [
    // SYSTÈME SOLAIRE INTERNE 
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
   
    // LUNE (TERRE)
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
   
    // LUNES DE MARS 
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
   
    // LUNES DE JUPITER
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
   
    //  LUNES DE SATURNE
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
   
    // CEINTURE D'ASTÉROÏDES
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