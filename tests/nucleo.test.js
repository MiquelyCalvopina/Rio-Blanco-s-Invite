import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  inicioUTC, finUTC, estado, icsCalendario, googleCalendarUrl, fechaICS, diaEcuador, SELLO_ICS
} from '../js/nucleo.js';

const datos = JSON.parse(readFileSync(new URL('../data/programa.json', import.meta.url)));
const A = datos.actividades;
const porId = (id) => A.find((a) => a.id === id);

test('las horas del programa se interpretan en hora del Ecuador (UTC-5)', () => {
  const misa = porId('22-1200-misa-accion-gracias');
  assert.equal(inicioUTC(misa).toISOString(), '2026-11-22T17:00:00.000Z');
  assert.equal(finUTC(misa).toISOString(), '2026-11-22T18:00:00.000Z');
});

test('diaEcuador usa la fecha del Ecuador aunque en UTC ya sea otro día', () => {
  // 23:30 del 13 en Ecuador = 04:30 UTC del 14
  assert.equal(diaEcuador(new Date('2026-11-14T04:30:00Z')), '2026-11-13');
});

test('antes de la fiesta: fase "antes" y lo próximo es la primera actividad', () => {
  const e = estado(A, new Date('2026-11-12T15:00:00Z'));
  assert.equal(e.fase, 'antes');
  assert.equal(e.proximo.id, '13-0800-embanderamiento');
});

test('durante una actividad: aparece en "ahora" y lo próximo es la siguiente', () => {
  // 18:20 Ecuador del 13 = 23:20 UTC
  const e = estado(A, new Date('2026-11-13T23:20:00Z'));
  assert.equal(e.fase, 'durante');
  assert.deepEqual(e.ahora.map((a) => a.id), ['13-1800-novena-1']);
  assert.equal(e.proximo.id, '13-1900-canelas');
});

test('entre actividades: ahora vacío, lo próximo es la siguiente', () => {
  // 11:00 Ecuador del 16 = 16:00 UTC (posada 10:00-11:00 ya terminó)
  const e = estado(A, new Date('2026-11-16T16:00:00Z'));
  assert.equal(e.ahora.length, 0);
  assert.equal(e.proximo.id, '16-1800-novena-4');
});

test('después de la fiesta: fase "despues"', () => {
  const e = estado(A, new Date('2026-11-23T12:00:00Z'));
  assert.equal(e.fase, 'despues');
  assert.equal(e.proximo, null);
});

test('fechaICS da formato UTC compacto', () => {
  assert.equal(fechaICS(new Date('2026-11-22T17:00:00Z')), '20261122T170000Z');
});

test('el .ics trae tres recordatorios (1 día antes, 2 horas antes y a la hora) por actividad y escapa texto', () => {
  const ics = icsCalendario([porId('21-1500-colchas')], datos.lugares, new Date('2026-11-13T00:00:00Z'));
  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /DTSTART:20261121T200000Z/);
  assert.equal((ics.match(/BEGIN:VALARM/g) || []).length, 3);
  assert.match(ics, /TRIGGER:PT0M/);
  assert.match(ics, /TRIGGER:-P1D/);
  assert.match(ics, /TRIGGER:-PT2H/);
  assert.ok(ics.includes('presentes taurinos'));
  for (const linea of ics.split('\r\n')) {
    assert.ok(Buffer.byteLength(linea, 'utf8') <= 75, `línea demasiado larga: ${linea}`);
  }
  assert.match(ics, /END:VCALENDAR\r\n$/);
});

test('las comas y punto y coma se escapan en el .ics', () => {
  const ics = icsCalendario([{ id: 'x', fecha: '2026-11-13', hora: '10:00', titulo: 'Uno, dos; tres', lugar: 'iglesia', detalle: '', gentileza: [] }], datos.lugares, new Date());
  assert.ok(ics.includes('SUMMARY:Uno\\, dos\\; tres'));
});

test('el enlace de Google Calendar lleva fechas UTC y zona del Ecuador', () => {
  const url = new URL(googleCalendarUrl(porId('22-1200-misa-accion-gracias'), datos.lugares, 'https://ejemplo.org/'));
  assert.equal(url.searchParams.get('action'), 'TEMPLATE');
  assert.equal(url.searchParams.get('dates'), '20261122T170000Z/20261122T180000Z');
  assert.equal(url.searchParams.get('ctz'), 'America/Guayaquil');
});

test('programa.json es válido', () => {
  const tipos = new Set(['religioso', 'cultural', 'popular', 'deportivo']);
  const ids = new Set();
  for (const a of A) {
    assert.ok(!ids.has(a.id), `id repetido ${a.id}`); ids.add(a.id);
    assert.ok(tipos.has(a.tipo), `tipo inválido en ${a.id}`);
    assert.ok(datos.lugares[a.lugar], `lugar inválido en ${a.id}`);
    assert.ok(a.fecha >= datos.fiesta.inicio && a.fecha <= datos.fiesta.fin, `fecha fuera de rango ${a.id}`);
    assert.match(a.hora, /^\d\d:\d\d$/);
    assert.ok(Array.isArray(a.gentileza));
  }
  const ordenado = [...A].sort((x, y) => (x.fecha + x.hora).localeCompare(y.fecha + y.hora));
  assert.deepEqual(A.map((a) => a.id), ordenado.map((a) => a.id), 'actividades fuera de orden');
});

test('los archivos .ics generados están al día', () => {
  const esperado = icsCalendario([porId('22-1200-misa-accion-gracias')], datos.lugares, SELLO_ICS);
  const archivo = readFileSync(new URL('../ics/22-1200-misa-accion-gracias.ics', import.meta.url), 'utf8');
  assert.equal(archivo, esperado);
});

test('cada actividad tiene un ícono propio dibujado', async () => {
  const { iconosAct } = await import('../js/ilustraciones.js');
  for (const a of A) assert.ok(iconosAct[a.icono], `ícono faltante en ${a.id}: ${a.icono}`);
});

test('las fotos de las actividades existen y las de terceros tienen crédito', async () => {
  const { existsSync } = await import('node:fs');
  for (const a of A.filter((x) => x.foto)) {
    assert.ok(existsSync(new URL('../' + a.foto, import.meta.url)), `falta la foto ${a.foto}`);
    if (!a.foto.includes('toros') && !a.foto.includes('colchas')) assert.ok(a.credito && a.credito.autor && a.credito.licencia, `falta crédito en ${a.id}`);
  }
});

test('todas las actividades siguen el mismo esquema de información', () => {
  const obligatorios = ['id', 'fecha', 'hora', 'titulo', 'tipo', 'icono', 'lugar', 'descripcion', 'aCargo', 'gentileza'];
  const permitidos = new Set([...obligatorios, 'destacado', 'anfitrion', 'foto', 'credito']);
  for (const a of A) {
    for (const k of obligatorios) assert.ok(k in a, `${a.id} no tiene ${k}`);
    for (const k of Object.keys(a)) assert.ok(permitidos.has(k), `${a.id} tiene un campo fuera del esquema: ${k}`);
    if (a.lugar === 'posada') assert.ok(a.anfitrion, `${a.id} es posada y no tiene anfitrión`);
  }
});

test('el .ics usa la descripción, quién está a cargo y la gentileza', () => {
  const ics = icsCalendario([porId('22-1200-misa-accion-gracias')], datos.lugares, SELLO_ICS).replace(/\r\n /g, '');
  assert.ok(ics.includes('A cargo de: Padre José Luis Tapia'));
});
