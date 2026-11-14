// Lógica pura: hora del Ecuador, estado de la fiesta y calendario.
// Sin acceso al DOM, para poder probarla con Node.

export const ZONA = 'America/Guayaquil';
const DESFASE_MS = 5 * 60 * 60 * 1000; // Ecuador continental: UTC-5, sin horario de verano
const DURACION_MS = 60 * 60 * 1000; // si el programa no da hora de fin
// Dirección pública de la invitación: va en cada recordatorio para ver el detalle y los cambios de horario.
export const URL_PUBLICA = 'https://miquelycalvopina.github.io/Rio-Blanco-s-Invite/';
export const enlaceDetalle = (a, urlSitio) => `Ver detalle y posibles cambios de horario: ${urlSitio}#a/${a.id}`;
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

function vevento(a, lugares, sello, urlSitio) {
  const lugar = lugares[a.lugar];
  const lineas = [
    'BEGIN:VEVENT',
    `UID:${a.id}@rioblancoalto-fiestas-2026`,
    `DTSTAMP:${fechaICS(sello)}`,
    `DTSTART:${fechaICS(inicioUTC(a))}`,
    `DTEND:${fechaICS(finUTC(a))}`,
    `SUMMARY:${escapar(a.titulo)}`,
    `DESCRIPTION:${escapar(descripcion(a, lugares) + (urlSitio ? '\n' + enlaceDetalle(a, urlSitio) : ''))}`,
    ...(urlSitio ? [`URL:${urlSitio}#a/${a.id}`] : []),
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

export function icsCalendario(actividades, lugares, sello = new Date(), urlSitio = URL_PUBLICA) {
  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rio Blanco Alto//Fiestas Virgen de El Quinche 2026//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Fiestas Río Blanco Alto 2026',
    `X-WR-TIMEZONE:${ZONA}`,
  ];
  for (const a of actividades) lineas.push(...vevento(a, lugares, sello, urlSitio));
  lineas.push('END:VCALENDAR');
  return lineas.map(plegar).join('\r\n') + '\r\n';
}

export function googleCalendarUrl(a, lugares, urlSitio) {
  const lugar = lugares[a.lugar];
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: a.titulo,
    dates: `${fechaICS(inicioUTC(a))}/${fechaICS(finUTC(a))}`,
    details: descripcion(a, lugares) + (urlSitio ? '\n' + enlaceDetalle(a, urlSitio) : ''),
    location: lugar ? `${lugar.nombre}, Río Blanco Alto, Tanicuchí` : 'Río Blanco Alto, Tanicuchí',
    ctz: ZONA,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

// Texto sin tildes ni mayúsculas, para comparar lo que escribe la persona.
export function normalizar(t) {
  return String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

// Busca actividades en todo el programa: título, descripción, lugar y personas nombradas.
// Todas las palabras escritas deben aparecer. Devuelve en orden del programa.
export function buscarActividades(actividades, lugares, texto) {
  const palabras = normalizar(texto).split(/\s+/).filter(Boolean);
  if (!palabras.length) return [];
  return actividades.filter((a) => {
    const l = lugares[a.lugar];
    const campo = normalizar([a.titulo, a.descripcion, a.aCargo, a.anfitrion, l && l.nombre, ...(a.gentileza || []), ...(a.participan || []).map((p) => p.nombre)].filter(Boolean).join(' '));
    return palabras.every((p) => campo.includes(p));
  });
}

// Separa «Nombre (aporte)» en sus dos partes. El nombre no se modifica.
export function separarAporte(texto) {
  const m = String(texto).match(/^(.*?)\s*\(([^()]+)\)$/);
  return m ? { nombre: m[1], aporte: m[2] } : { nombre: String(texto), aporte: '' };
}

// Todas las personas y grupos a quienes se agradece en una actividad:
// posada, a cargo, participantes y gentilezas, en ese orden.
export function reconocimientos(a) {
  const r = [];
  if (a.anfitrion) r.push({ nombre: a.anfitrion, rol: 'Posada', motivo: `por recibir a Nuestra Patrona en la posada, «${a.titulo}»` });
  if (a.aCargo) {
    let nombre = a.aCargo; let rol = 'A cargo';
    const s = separarAporte(nombre);
    if (nombre.startsWith('Comisionados: ')) { nombre = nombre.slice(14); rol = 'Comisionados'; }
    else if (/Priostes 2025/.test(s.aporte)) { nombre = s.nombre; rol = 'Priostes salientes 2025'; }
    r.push({ nombre, rol, motivo: `por estar a cargo de «${a.titulo}»` });
  }
  for (const p of a.participan || []) r.push({ nombre: p.nombre, rol: p.rol, motivo: `por su ${p.rol.toLowerCase()} en «${a.titulo}»` });
  for (const g of a.gentileza || []) {
    const s = separarAporte(g);
    r.push({ nombre: s.nombre, rol: s.aporte ? s.aporte.charAt(0).toUpperCase() + s.aporte.slice(1) : '', motivo: `por su gentileza${s.aporte ? ` (${s.aporte})` : ''} en «${a.titulo}»`, mensaje: a.mensajeGracias || '' });
  }
  return r;
}

// Lista única de quienes hicieron posible la fiesta, cada uno con todo aquello en que colaboró.
// Los Priostes van aparte, así que sus menciones genéricas no se repiten aquí.
// Se ordena por nombre, sin contar el tratamiento (Sr., Lic., Flia., …). Los nombres no se modifican.
const TRATAMIENTO = /^(Sres\.|Sr\.|Sra\.|Srta\.|Lic\.|Ings\.|Ing\.|Dra\.|Dr\.|Mg\.|Msc\.|Abg\.|Arq\.|Eco\.|Tnlgo\.|M\. V\.|Niña|Niño|Flia\.|Familia|Hnos\.|Hnas\.|Padre)\s+/i;
export function claveOrden(nombre) {
  let n = String(nombre);
  while (TRATAMIENTO.test(n)) n = n.replace(TRATAMIENTO, '');
  return normalizar(n);
}
export function colaboradores(actividades) {
  const mapa = new Map();
  for (const a of actividades) {
    for (const r of reconocimientos(a)) {
      if (/^Señores Priostes 2026/.test(r.nombre)) continue;
      // «Nombre» y «Nombre, cargo» son la misma persona: se juntan y se muestra la forma más completa.
      const clave = r.nombre.split(', ')[0];
      if (!mapa.has(clave)) mapa.set(clave, { nombre: r.nombre, aportes: [] });
      if (r.nombre.length > mapa.get(clave).nombre.length) mapa.get(clave).nombre = r.nombre;
      mapa.get(clave).aportes.push({ rol: r.rol || 'Gentileza', titulo: a.titulo, fecha: a.fecha, hora: a.hora, id: a.id, mensaje: r.mensaje || '' });
    }
  }
  return [...mapa.values()].sort((x, y) => claveOrden(x.nombre).localeCompare(claveOrden(y.nombre), 'es'));
}
