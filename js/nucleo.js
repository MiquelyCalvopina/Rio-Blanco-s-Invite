// Lógica pura: hora del Ecuador, estado de la fiesta y calendario.
// Sin acceso al DOM, para poder probarla con Node.

export const ZONA = 'America/Guayaquil';
const DESFASE_MS = 5 * 60 * 60 * 1000; // Ecuador continental: UTC-5, sin horario de verano
const DURACION_MS = 60 * 60 * 1000; // si el programa no da hora de fin
export const SELLO_ICS = new Date('2026-11-13T00:00:00Z');
export const RECORDATORIOS = ['-P1D', '-PT2H', 'PT0M']; // 1 día antes, 2 horas antes y a la hora

export function inicioUTC(a) {
  const [y, m, d] = a.fecha.split('-').map(Number);
  const [h, min] = a.hora.split(':').map(Number);
  return new Date(Date.UTC(y, m - 1, d, h, min) + DESFASE_MS);
}

export function finUTC(a) {
  if (a.horaFin) return inicioUTC({ fecha: a.fecha, hora: a.horaFin });
  return new Date(inicioUTC(a).getTime() + DURACION_MS);
}

export function diaEcuador(ahora) {
  return new Date(ahora.getTime() - DESFASE_MS).toISOString().slice(0, 10);
}

export function horaEcuador(ahora) {
  return new Date(ahora.getTime() - DESFASE_MS).toISOString().slice(11, 16);
}

export function estado(actividades, ahora) {
  const t = ahora.getTime();
  // En la vista "Qué está pasando", una actividad dura hasta que empieza la siguiente (máximo su fin).
  const enCurso = actividades.filter((a, i) => {
    const sig = actividades[i + 1];
    const fin = Math.min(finUTC(a).getTime(), sig ? inicioUTC(sig).getTime() : Infinity);
    return inicioUTC(a).getTime() <= t && t < fin;
  });
  const proximo = actividades.find((a) => inicioUTC(a).getTime() > t) || null;
  const primera = actividades[0];
  const ultima = actividades[actividades.length - 1];
  let fase = 'durante';
  if (t < inicioUTC(primera).getTime()) fase = 'antes';
  else if (t >= finUTC(ultima).getTime()) fase = 'despues';
  return { fase, ahora: enCurso, proximo };
}

export function fechaICS(fecha) {
  return fecha.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapar(texto) {
  return String(texto)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

// Pliega líneas a 75 octetos (RFC 5545 §3.1) sin cortar caracteres UTF-8.
function plegar(linea) {
  const partes = [];
  let actual = '';
  let bytes = 0;
  for (const ch of linea) {
    const b = new TextEncoder().encode(ch).length;
    const limite = partes.length === 0 ? 75 : 74; // las continuaciones empiezan con un espacio
    if (bytes + b > limite) {
      partes.push(actual);
      actual = '';
      bytes = 0;
    }
    actual += ch;
    bytes += b;
  }
  partes.push(actual);
  return partes.join('\r\n ');
}

export function descripcion(a, lugares) {
  const lineas = [];
  if (a.descripcion) lineas.push(a.descripcion);
  if (a.anfitrion) lineas.push('Posada: ' + a.anfitrion);
  if (a.aCargo) lineas.push('A cargo de: ' + a.aCargo + '.');
  if (a.gentileza && a.gentileza.length) lineas.push('Gracias a: ' + a.gentileza.join(', ') + '.');
  lineas.push('Fiestas en honor a la Santísima Virgen de El Quinche · Río Blanco Alto 2026.');
  const lugar = lugares[a.lugar];
  if (lugar && lugar.mapa) lineas.push('Cómo llegar: ' + lugar.mapa);
  return lineas.join('\n');
}

function vevento(a, lugares, sello) {
  const lugar = lugares[a.lugar];
  const lineas = [
    'BEGIN:VEVENT',
    `UID:${a.id}@rioblancoalto-fiestas-2026`,
    `DTSTAMP:${fechaICS(sello)}`,
    `DTSTART:${fechaICS(inicioUTC(a))}`,
    `DTEND:${fechaICS(finUTC(a))}`,
    `SUMMARY:${escapar(a.titulo)}`,
    `DESCRIPTION:${escapar(descripcion(a, lugares))}`,
    `LOCATION:${escapar(lugar ? lugar.nombre + ', Río Blanco Alto, Tanicuchí' : 'Río Blanco Alto, Tanicuchí')}`,
  ];
  for (const disparo of RECORDATORIOS) {
    lineas.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapar(a.titulo)}`,
      `TRIGGER:${disparo}`,
      'END:VALARM'
    );
  }
  lineas.push('END:VEVENT');
  return lineas;
}

export function icsCalendario(actividades, lugares, sello = new Date()) {
  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rio Blanco Alto//Fiestas Virgen de El Quinche 2026//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Fiestas Río Blanco Alto 2026',
    `X-WR-TIMEZONE:${ZONA}`,
  ];
  for (const a of actividades) lineas.push(...vevento(a, lugares, sello));
  lineas.push('END:VCALENDAR');
  return lineas.map(plegar).join('\r\n') + '\r\n';
}

export function googleCalendarUrl(a, lugares, urlSitio) {
  const lugar = lugares[a.lugar];
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: a.titulo,
    dates: `${fechaICS(inicioUTC(a))}/${fechaICS(finUTC(a))}`,
    details: descripcion(a, lugares) + (urlSitio ? `\n${urlSitio}#a/${a.id}` : ''),
    location: lugar ? `${lugar.nombre}, Río Blanco Alto, Tanicuchí` : 'Río Blanco Alto, Tanicuchí',
    ctz: ZONA,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}
