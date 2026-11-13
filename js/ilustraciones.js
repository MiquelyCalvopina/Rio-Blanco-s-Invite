// Ilustraciones de línea dorada (trazo tipo marcador). Todos los trazos son <path>
// para poder animarlos con stroke-dasharray.

export const torito = `
<svg viewBox="0 0 120 120" class="ilus" aria-hidden="true">
  <g class="trazo">
    <path d="M38 44 C30 42 20 36 18 22 C17 16 20 12 24 10"/>
    <path d="M82 44 C90 42 100 36 102 22 C103 16 100 12 96 10"/>
    <path d="M38 44 C44 38 52 36 60 36 C68 36 76 38 82 44 C86 54 82 64 78 72 C76 82 74 94 66 100 C62 103 58 103 54 100 C46 94 44 82 42 72 C38 64 34 54 38 44 Z"/>
    <path d="M38 50 C30 50 24 48 20 44 C24 54 32 56 40 56"/>
    <path d="M82 50 C90 50 96 48 100 44 C96 54 88 56 80 56"/>
    <path d="M53 40 C56 45 58 47 60 47 C62 47 64 45 67 40"/>
    <path d="M47 61 Q50.5 57.5 54 61"/>
    <path d="M66 61 Q69.5 57.5 73 61"/>
    <path d="M51 91 C55 96 65 96 69 91"/>
    <path d="M55.5 88.5 L55.6 88.6"/>
    <path d="M64.5 88.5 L64.6 88.6"/>
  </g>
</svg>`;

export const iglesia = `
<svg viewBox="0 0 140 120" class="ilus" aria-hidden="true">
  <g class="trazo">
    <path d="M12 110 H128"/>
    <path d="M58 110 V56 H82 V110"/>
    <path d="M56 56 L70 33 L84 56"/>
    <path d="M70 33 V17 M64 23 H76"/>
    <path d="M65 74 V66 A5 5 0 0 1 75 66 V74 Z"/>
    <path d="M63 110 V97 A7 7 0 0 1 77 97 V110"/>
    <path d="M24 110 V72 H42 V110"/>
    <path d="M22 72 L33 53 L44 72"/>
    <path d="M33 53 V41 M28.5 45.5 H37.5"/>
    <path d="M30 93 V87 A3 3 0 0 1 36 87 V93"/>
    <path d="M98 110 V72 H116 V110"/>
    <path d="M96 72 L107 53 L118 72"/>
    <path d="M107 53 V41 M102.5 45.5 H111.5"/>
    <path d="M104 93 V87 A3 3 0 0 1 110 87 V93"/>
    <path d="M42 86 H58 M82 86 H98"/>
  </g>
</svg>`;

export const virgen = `
<svg viewBox="0 0 120 160" class="ilus" role="img" aria-label="Santísima Virgen de El Quinche">
  <g class="halo">
    <circle cx="60" cy="37" r="27"/>
    <path d="M60 4 V0 M84 13 L87 10 M93 37 H97 M36 13 L33 10 M27 37 H23"/>
  </g>
  <g class="trazo">
    <path d="M60 19 V12 M57.5 14.5 H62.5"/>
    <path d="M52.5 29 L53.5 22 L56.8 25.8 L60 19.5 L63.2 25.8 L66.5 22 L67.5 29 Z"/>
    <path d="M60 31 C63.4 31 65.4 34 65.4 37.4 C65.4 41.4 63 44 60 44 C57 44 54.6 41.4 54.6 37.4 C54.6 34 56.6 31 60 31 Z"/>
    <path d="M54.5 33 C51.5 38 51.5 45 53.5 49 M65.5 33 C68.5 38 68.5 45 66.5 49"/>
    <path d="M52.5 29.5 C47 35 45 43 45 52 L24 140 Q60 150 96 140 L75 52 C75 43 73 35 67.5 29.5"/>
    <path d="M54 50 C52 72 50 110 48 141"/>
    <path d="M66 50 C68 72 70 110 72 141"/>
    <path d="M51 58 L45 88"/>
    <path d="M51.6 54.4 L51.7 54.5"/>
    <path d="M71 57.5 C73.5 57.5 75.5 59.5 75.5 62 C75.5 64.5 73.5 66.5 71 66.5 C68.5 66.5 66.5 64.5 66.5 62 C66.5 59.5 68.5 57.5 71 57.5 Z"/>
    <path d="M67.5 57 L68.3 52.8 L70 55.6 L71.2 51.8 L72.6 55.6 L74.2 52.8 L74.8 57"/>
    <path d="M66 69 C65 77 69 82 76 80 C78.5 74 76.5 69 72 68"/>
    <path d="M78.5 70 C80 70 81.2 71.2 81.2 72.7 C81.2 74.2 80 75.4 78.5 75.4 C77 75.4 75.8 74.2 75.8 72.7 C75.8 71.2 77 70 78.5 70 Z M78.5 70 V66.6 M77 67.8 H80"/>
    <path d="M33 112 C36 108 40 108 42 112 M78 112 C80 108 84 108 87 112"/>
    <path d="M30 128 C33 124 37 124 39 128 M81 128 C83 124 87 124 90 128"/>
    <path d="M28 147 Q60 160 92 147"/>
  </g>
</svg>`;

export const cotopaxi = `
<svg viewBox="0 0 200 40" class="ilus cotopaxi" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
  <g class="trazo fino">
    <path d="M0 39 L84 11 Q100 5 116 11 L200 39"/>
    <path d="M72 15 L80 19 L88 14 L96 19 L104 14 L112 19 L124 14"/>
  </g>
</svg>`;

const ico = (d) => `<svg viewBox="0 0 24 24" class="ico" aria-hidden="true">${d}</svg>`;
export const iconos = {
  compartir: ico('<path d="M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>'),
  calendario: ico('<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
  calMas: ico('<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/>'),
  calOk: ico('<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M9 15.2l2 2 4-4"/>'),
  mapa: ico('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>'),
  reloj: ico('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  personas: ico('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'),
  inicio: ico('<path d="M4 20V10l8-6 8 6v10M10 20v-5h4v5"/>'),
  programa: ico('<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M7.5 14h3M13.5 14h3M7.5 17h3"/>'),
  gratitud: ico('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'),
  cerrar: ico('<path d="M6 6l12 12M18 6L6 18"/>'),
  buscar: ico('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>'),
  chev: ico('<path d="M9 6l6 6-6 6"/>'),
  atras: ico('<path d="M15 6l-6 6 6 6"/>'),
  sol: ico('<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>'),
  luna: ico('<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>'),
  google: ico('<path d="M20 12.2c0-.6-.1-1.2-.2-1.7H12v3.3h4.5a3.9 3.9 0 0 1-1.7 2.5M12 20.5a8.5 8.5 0 1 1 5.7-14.8"/>'),
  parqueo: ico('<rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="M10 16.5V7.5h3a2.6 2.6 0 0 1 0 5.2h-3"/>'),
  banos: ico('<path d="M3 8l1.6 8L6.5 10l1.9 6L10 8"/><path d="M19.5 9.5A3.5 3.5 0 1 0 19.5 14.5"/>'),
  comida: ico('<path d="M7 3v7a2 2 0 0 0 2 2v9M11 3v7a2 2 0 0 1-2 2M9 3v6"/><path d="M16.5 21V3c-2 1.5-3 4-3 7 0 1.5.8 2.5 3 2.5"/>'),
  ruta: ico('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><path d="M9.5 10.2l1.8 1.8 3.4-3.6"/>'),
  descargar: ico('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
};

// Íconos propios de las actividades de la fiesta (trazo 24×24).
const ia = (d) => `<svg viewBox="0 0 24 24" class="ico" aria-hidden="true">${d}</svg>`;
export const iconosAct = {
  trompeta: ia('<path d="M3 10.5h10.5M3 13.5h10.5M3 9v6"/><path d="M13.5 10.5L20 7v10l-6.5-3.5"/><path d="M6.5 10.5V8M9 10.5V8M11.5 10.5V8"/>'),
  guitarra: ia('<path d="M13.5 10.5L20 4M18 3l3 3"/><path d="M11.2 9.2c-1.6-1-3.8-.8-5.2.6-1.2 1.2-1.1 2.6-.2 3.4-1.6.4-2.6 1.6-2.3 3.2.4 2 2.7 3.7 4.6 3.9 1.6.2 2.8-.8 3.2-2.3.8.9 2.2 1 3.4-.2 1.4-1.4 1.6-3.6.6-5.2z"/><circle cx="9.6" cy="14.4" r="1.4"/>'),
  canelas: ia('<path d="M4.5 10h11v3.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M15.5 11h1.5a2.2 2.2 0 0 1 0 4.4h-1.7"/><path d="M8 3.5c-.8 1.2.8 1.8 0 3M11.5 3.5c-.8 1.2.8 1.8 0 3"/><path d="M3.5 21h14"/>'),
  fogata: ia('<path d="M12 3c2.2 2.8 4.5 4.6 4.5 8.2a4.5 4.5 0 0 1-9 0c0-1.9.9-3 2-4 .1 1.6.8 2.6 1.9 3 .1-2.8-.9-4.3.6-7.2z"/><path d="M4 21l16-4M20 21L4 17"/>'),
  pirotecnia: ia('<circle cx="12" cy="11" r="1.2"/><path d="M12 3.5v3M12 15.5v3M4.5 11h3M16.5 11h3M6.7 5.7l2.1 2.1M15.2 14.2l2.1 2.1M6.7 16.3l2.1-2.1M15.2 7.8l2.1-2.1"/><path d="M12 18.5V21"/>'),
  toro: ia('<path d="M7.2 9.2C4.8 9.2 3.2 7.6 3.2 5.2M16.8 9.2c2.4 0 4-1.6 4-4"/><path d="M7.2 9.2c1.2-1.1 3-1.6 4.8-1.6s3.6.5 4.8 1.6c.6 3-.9 5.2-1.6 7.3-.6 2.2-1.6 3.8-3.2 3.8s-2.6-1.6-3.2-3.8c-.7-2.1-2.2-4.3-1.6-7.3z"/><path d="M10 17.3c1.3.6 2.7.6 4 0M10 12.2h.01M14 12.2h.01"/>'),
  colcha: ia('<rect x="4" y="4.5" width="16" height="13" rx="1.5"/><path d="M4 8.8h16M4 13.2h16"/><path d="M6.5 17.5v2.5M9.5 17.5v2.5M12 17.5v2.5M14.5 17.5v2.5M17.5 17.5v2.5"/>'),
  lazo: ia('<ellipse cx="13" cy="14.5" rx="7.5" ry="5"/><path d="M8.5 10.5C7 8 5.5 5.5 3 4"/><path d="M5.5 14.5c0-1 .4-2 1.1-2.8"/>'),
  sombrero: ia('<path d="M2.5 15.5c2.2 1.6 5.8 2.3 9.5 2.3s7.3-.7 9.5-2.3"/><path d="M7 16.2v-4.7c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5v4.7"/><path d="M7 12.6c3.3 1 6.7 1 10 0"/>'),
  iglesia: ia('<path d="M12 2.5v4M10.3 4.2h3.4"/><path d="M5.5 21v-9.5L12 7l6.5 4.5V21"/><path d="M10 21v-3.5a2 2 0 0 1 4 0V21"/><path d="M3 21h18"/>'),
  vela: ia('<path d="M9.8 10h4.4v10.5H9.8z"/><path d="M12 10V8.3"/><path d="M12 3c1.6 1.8 1.6 3.2 0 4.6-1.6-1.4-1.6-2.8 0-4.6z"/><path d="M6.5 20.5h11"/>'),
  virgen: ia('<path d="M12 5a1.9 1.9 0 1 1 0 3.8A1.9 1.9 0 0 1 12 5z"/><path d="M10.3 4.6l.5-1.8 1.2 1 1.2-1 .5 1.8"/><path d="M10 9.3L6 20.5h12L14 9.3"/><path d="M10 13h4"/>'),
  peregrinacion: ia('<path d="M8.5 21l2.5-17M15.5 21L13 4"/><path d="M12 6.5v1.8M12 11v1.8M12 15.5v2"/>'),
  flor: ia('<circle cx="12" cy="8" r="1.6"/><path d="M12 6.4c-1.2-2.4 1.2-3.8 2-2.2.7 1.3-.4 2.4-2 2.2zM13.6 8c2.4-1.2 3.8 1.2 2.2 2-1.3.7-2.4-.4-2.2-2zM12 9.6c1.2 2.4-1.2 3.8-2 2.2-.7-1.3.4-2.4 2-2.2zM10.4 8C8 9.2 6.6 6.8 8.2 6c1.3-.7 2.4.4 2.2 2z"/><path d="M12 10v11M12 17c-2.4 0-4-1.3-4-3.3M12 19c2.4 0 4-1.3 4-3.3"/>'),
  bandera: ia('<path d="M5.5 21V3.5"/><path d="M5.5 4.5h12.5l-2.5 4 2.5 4H5.5"/>'),
  estandarte: ia('<path d="M12 2.5v19"/><path d="M6.5 5.5h11v9l-5.5-2.5-5.5 2.5z"/><path d="M12 7v3.5M10.4 8.5h3.2"/>'),
  corona: ia('<path d="M4 17.5L3 8l5 4 4-7 4 7 5-4-1 9.5z"/><path d="M4 20.5h16"/>'),
  bici: ia('<circle cx="6" cy="16" r="3.6"/><circle cx="18" cy="16" r="3.6"/><path d="M6 16l3.6-6.5h5.2L18 16M9.6 9.5L12 16H6M13.5 6.5h2.4l-1.1 3"/>'),
  balon: ia('<circle cx="12" cy="12" r="8.5"/><path d="M12 8.6l3 2.2-1.1 3.5h-3.8L9 10.8z"/><path d="M12 8.6V3.5M15 10.8l4.8-1.6M13.9 14.3l3 4.1M10.1 14.3l-3 4.1M9 10.8L4.2 9.2"/>'),
  voley: ia('<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5c2.3 3.3 2.2 8.3-1 12.4M4.2 9c3.7-1.2 8.3.4 10.9 4.3M6.6 18.6c1.1-3.8 5-6.8 10.2-6.6"/>'),
  gallo: ia('<path d="M8.5 20.5h7M12 20.5v-3"/><path d="M7 11.5c0-3.3 2.2-5.7 5-5.7.9 0 1.7.3 2.3.8l2.4-.6-.8 2.2c.9 1 1.4 2.3 1.4 3.6 0 3.3-2.5 5.7-5.3 5.7S7 15 7 11.5z"/><path d="M11.3 5.9c-.6-1 0-2.4 1.1-2.6.2.9.9 1.4 1.6 1.4M7 11.5c-1.6-.4-3-1.6-3.5-3.6 1.4.3 2.6.9 3.6 1.9M14.6 9.4h.01"/>'),
  frutas: ia('<path d="M3 11.5h18l-2.2 9H5.2z"/><path d="M7 11.5a3.2 3.2 0 0 1 4.5-3M12.5 11.5a3.4 3.4 0 0 1 5.5-2.2"/><path d="M11.5 8.5c0-1.5.7-2.8 2-3.5M8.5 14.5v3M12 14.5v3M15.5 14.5v3"/>'),
  albazo: ia('<path d="M3 18.5h18"/><path d="M6.5 18.5a5.5 5.5 0 0 1 11 0"/><path d="M12 6.5v3M5.4 9.8l2 1.6M18.6 9.8l-2 1.6"/>'),
  escoba: ia('<path d="M15.5 3l-4.2 8.3"/><path d="M7.5 12.5h7.2l2.3 8H5.2z"/><path d="M9.2 15.5l-.4 5M12 15.5v5M14.8 15.5l.4 5"/>'),
  trompo: ia('<path d="M6.5 6h11"/><path d="M7.4 6L12 20l4.6-14"/><path d="M12 20v1.5M9.2 10.5h5.6"/><path d="M12 6V3.5"/>'),
  danza: ia('<circle cx="12" cy="4.8" r="1.9"/><path d="M12 6.7v6.8M12 9l-5.5-2.6M12 9l5-3.4M12 13.5l-3.4 7M12 13.5l4 6.3"/>'),
  musica: ia('<path d="M9 18V6.5l10-2v11.5"/><circle cx="6.8" cy="18" r="2.2"/><circle cx="16.8" cy="16" r="2.2"/><path d="M9 10l10-2"/>'),
  personas: ia('<circle cx="8.2" cy="8" r="2.6"/><circle cx="16.2" cy="8.6" r="2.3"/><path d="M3 19.5c0-3 2.3-5.2 5.2-5.2s5.2 2.2 5.2 5.2M13.6 15c.8-.5 1.7-.7 2.6-.7 2.6 0 4.8 2 4.8 4.8"/>'),
};
