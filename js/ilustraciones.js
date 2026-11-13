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

export const iconos = {
  compartir: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>',
  calendario: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M12 13.5v4M10 15.5h4"/></svg>',
  mapa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/></svg>',
  inicio: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10l8-6 8 6v10M10 20v-5h4v5"/></svg>',
  programa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>',
  gratitud: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  cerrar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  buscar: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>',
  apple: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  google: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12.2c0-.6-.1-1.2-.2-1.7H12v3.3h4.5a3.9 3.9 0 0 1-1.7 2.5v2.1h2.7c1.6-1.5 2.5-3.6 2.5-6.2z"/><path d="M12 20.5c2.3 0 4.2-.8 5.5-2.1l-2.7-2.1c-.7.5-1.7.8-2.8.8-2.2 0-4-1.5-4.7-3.4H4.5v2.2a8.5 8.5 0 0 0 7.5 4.6z"/><path d="M7.3 13.7a5 5 0 0 1 0-3.4V8.1H4.5a8.5 8.5 0 0 0 0 7.8z"/><path d="M12 6.9c1.3 0 2.4.4 3.3 1.3l2.4-2.4A8.5 8.5 0 0 0 4.5 8.1l2.8 2.2C8 8.4 9.8 6.9 12 6.9z"/></svg>',
  descargar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
};
