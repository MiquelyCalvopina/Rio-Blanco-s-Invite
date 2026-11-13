import { estado, inicioUTC, diaEcuador, horaEcuador, googleCalendarUrl } from './nucleo.js';
import { torito, iglesia, virgen, cotopaxi, iconos } from './ilustraciones.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const URL_SITIO = location.origin + location.pathname;
const TIPOS = { religioso: 'Religioso', cultural: 'Cultural', popular: 'Popular', deportivo: 'Deportivo' };
const DIAS_SEM = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const so = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  ? 'ios' : /Android/i.test(navigator.userAgent) ? 'android' : 'otro';

let D; // datos
const ui = { dia: null, filtro: 'todo' };

// Permite fijar la hora en pruebas: ?ahora=2026-11-14T18:20 (hora del Ecuador)
function ahora() {
  const p = new URLSearchParams(location.search).get('ahora');
  return p ? new Date(p + ':00-05:00') : new Date();
}

const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fechaLarga = (f) => { const d = new Date(f + 'T12:00:00Z'); return `${DIAS_SEM[d.getUTCDay()]} ${d.getUTCDate()} de ${MESES[d.getUTCMonth()]}`; };
const lugar = (a) => D.lugares[a.lugar];
const lugarTexto = (a) => (a.lugar === 'posada' ? a.detalle.replace(/\.$/, '') : lugar(a).nombre);
const dias = () => [...new Set(D.actividades.map((a) => a.fecha))];

/* ---------- Splash ---------- */
function prepararTrazos(cont, inicio = 0, paso = 0.12, dur = 0.9) {
  $$('.trazo path', cont).forEach((p, i) => {
    const l = Math.ceil(p.getTotalLength()) + 2;
    p.style.setProperty('--l', l);
    p.style.setProperty('--retraso', `${inicio + i * paso}s`);
    p.style.setProperty('--dur', `${dur}s`);
  });
  cont.classList.add('dibujar');
}

function splash() {
  const s = $('#splash');
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visto = false;
  try { visto = sessionStorage.getItem('splash') === '1'; } catch {}
  if (visto) { s.remove(); return; }
  $('#splash-toro').innerHTML = torito;
  $('#splash-iglesia').innerHTML = iglesia;
  if (!reducido) {
    prepararTrazos($('#splash-toro'), 0, 0.1, 0.7);
    prepararTrazos($('#splash-iglesia'), 0.5, 0.07, 0.6);
  }
  const t1 = setTimeout(() => s.classList.add('textos'), reducido ? 0 : 1300);
  const cerrar = () => {
    clearTimeout(t1); clearTimeout(t2);
    s.classList.add('textos', 'fuera');
    try { sessionStorage.setItem('splash', '1'); } catch {}
    setTimeout(() => s.remove(), 600);
  };
  const t2 = setTimeout(cerrar, reducido ? 1200 : 3200);
  s.addEventListener('click', cerrar, { once: true });
}

/* ---------- Navegación ---------- */
function ir(vista, { sinScroll } = {}) {
  for (const v of ['inicio', 'programa', 'gratitud']) $(`#vista-${v}`).hidden = v !== vista;
  $$('.tab').forEach((t) => (t.dataset.ir === vista ? t.setAttribute('aria-current', 'page') : t.removeAttribute('aria-current')));
  if (!sinScroll) window.scrollTo(0, 0);
  if (vista === 'programa') {
    const sel = $('.dia[aria-selected="true"]');
    if (sel) sel.scrollIntoView({ inline: 'center', block: 'nearest' });
  }
}

/* ---------- Inicio ---------- */
function pintarEstado() {
  const e = estado(D.actividades, ahora());
  const caja = $('#estado');
  const fila = (etq, a, vivo) => `
    <button data-act="${a.id}">
      <span class="etq">${vivo ? '<i class="vivo"></i>' : ''}${etq}</span>
      <p class="tit">${esc(a.titulo)}</p>
      <p class="met">${esc(fechaCorta(a))} · ${esc(lugarTexto(a))}</p>
    </button>`;
  let html = '';
  if (e.fase === 'despues') {
    html = `<div style="padding:14px 16px"><p class="etq">Gracias</p><p class="tit">Las fiestas de 2026 terminaron</p><p class="met">Gracias por acompañar a Nuestra Patrona. Raíces fuertes, tradiciones vivas.</p></div>`;
  } else {
    if (e.fase === 'antes') html += `<div style="padding:14px 16px 0"><p class="etq">Faltan ${diasFaltan()}</p></div>`;
    e.ahora.forEach((a) => { html += fila('Ahora', a, true); });
    if (e.proximo) html += fila('Lo próximo', e.proximo, false);
  }
  caja.innerHTML = html;
}

function fechaCorta(a) {
  const hoy = diaEcuador(ahora());
  const manana = diaEcuador(new Date(ahora().getTime() + 864e5));
  const dia = a.fecha === hoy ? 'Hoy' : a.fecha === manana ? 'Mañana' : fechaLarga(a.fecha);
  return `${dia} · ${a.hora}`;
}

function diasFaltan() {
  const ms = inicioUTC(D.actividades[0]).getTime() - ahora().getTime();
  const d = Math.ceil(ms / 864e5);
  return d <= 1 ? 'pocas horas' : `${d} días`;
}

/* ---------- Programa ---------- */
function pintarDias() {
  const hoy = diaEcuador(ahora());
  const grandes = new Set(D.actividades.filter((a) => a.destacado).map((a) => a.fecha));
  $('#dias').innerHTML = dias().map((f) => {
    const d = new Date(f + 'T12:00:00Z');
    return `<button class="dia${grandes.has(f) ? ' grande' : ''}" role="tab" data-dia="${f}" aria-selected="${f === ui.dia}" aria-label="${fechaLarga(f)}">
      ${DIAS_SEM[d.getUTCDay()].slice(0, 3)}<b>${d.getUTCDate()}</b>${f === hoy ? '<span class="hoy">HOY</span>' : ''}</button>`;
  }).join('');
}

function pintarFiltros() {
  const ops = [['todo', 'Todo'], ...Object.entries(TIPOS)];
  $('#filtros').innerHTML = ops.map(([k, v]) => `<button class="chip" data-filtro="${k}" aria-pressed="${ui.filtro === k}">${v}</button>`).join('');
}

function filaAct(a) {
  const lugTxt = lugarTexto(a);
  return `<li><button class="act${a.destacado ? ' destacada' : ''}" data-act="${a.id}">
    <span class="hora">${a.hora}</span>
    <span><span class="tipo t-${a.tipo}">${TIPOS[a.tipo]}</span>
    <p class="tit">${esc(a.titulo)}</p>
    <p class="lug">${esc(lugTxt)}</p></span></button></li>`;
}

function pintarLista() {
  const hoy = diaEcuador(ahora());
  const hora = horaEcuador(ahora());
  const acts = D.actividades.filter((a) => a.fecha === ui.dia && (ui.filtro === 'todo' || a.tipo === ui.filtro));
  $('#dia-titulo').textContent = fechaLarga(ui.dia);
  if (!acts.length) { $('#lista').innerHTML = `<li class="vacio">No hay actividades de este tipo este día.</li>`; return; }
  const linea = `<li class="ahora-linea" id="ahora">Ahora · ${hora}</li>`;
  const dia = acts.filter((a) => a.hora < '18:00');
  const noche = acts.filter((a) => a.hora >= '18:00');
  // Posición de la línea "Ahora": antes de la primera actividad que aún no empieza.
  let pos = -1;
  if (ui.dia === hoy) { pos = acts.findIndex((a) => a.hora > hora); if (pos < 0) pos = acts.length; }
  const enDia = pos >= 0 && (pos < dia.length || (pos === dia.length && (hora < '18:00' || !noche.length)));
  const enNoche = pos >= 0 && !enDia;
  const pintar = (lista, desde, poner) => lista.map((a, i) => (poner && desde + i === pos ? linea : '') + filaAct(a)).join('')
    + (poner && pos === desde + lista.length ? linea : '');
  let html = pintar(dia, 0, enDia);
  if (noche.length) html += `<li class="bloque-noche"><p>Noche</p><ol>${pintar(noche, dia.length, enNoche)}</ol></li>`;
  $('#lista').innerHTML = html;
}

/* ---------- Hoja: detalle y calendario ---------- */
function abrirHoja(html) {
  $('#hoja-contenido').innerHTML = html;
  $('#hoja').hidden = false; $('#velo').hidden = false;
  document.body.style.overflow = 'hidden';
  $('#hoja-cerrar').focus();
}
function cerrarHoja() {
  $('#hoja').hidden = true; $('#velo').hidden = true;
  document.body.style.overflow = '';
  if (location.hash.startsWith('#a/')) history.replaceState(null, '', location.pathname + location.search);
}

function detalle(id) {
  const a = D.actividades.find((x) => x.id === id);
  if (!a) return;
  history.replaceState(null, '', `#a/${a.id}`);
  const l = lugar(a);
  const gent = a.gentileza.length ? `<div class="gent"><p>Gentileza de</p><ul>${a.gentileza.map((g) => `<li>${esc(g)}</li>`).join('')}</ul></div>` : '';
  const quees = a.queEs ? `<div class="quees"><b>Qué es</b>${esc(a.queEs)}</div>` : '';
  const mapa = l.mapa ? `<a class="accion" href="${l.mapa}" target="_blank" rel="noopener">${iconos.mapa}Cómo llegar</a>` : '';
  abrirHoja(`
    <p class="tipo t-${a.tipo}">${TIPOS[a.tipo]}</p>
    <h2 id="hoja-titulo">${esc(a.titulo)}</h2>
    <p class="cuando">${fechaLarga(a.fecha)} · ${a.hora}</p>
    <p class="donde">${esc(l.nombre)}</p>
    ${a.detalle ? `<p class="det">${esc(a.detalle)}</p>` : ''}
    ${quees}${gent}
    <div class="acciones">
      <button class="accion principal" data-cal="${a.id}">${iconos.calendario}Calendario</button>
      ${mapa}
      <button class="accion" data-compartir-act="${a.id}">${iconos.compartir}Compartir</button>
    </div>`);
}

function calendario(id) {
  const a = D.actividades.find((x) => x.id === id);
  const ios = `<a class="opcion${so !== 'android' ? ' primera' : ''}" href="ics/${a.id}.ics">${iconos.apple}<span><b>iPhone · Calendario</b><span>Incluye los dos recordatorios</span></span></a>`;
  const goo = `<a class="opcion${so === 'android' ? ' primera' : ''}" href="${googleCalendarUrl(a, D.lugares, URL_SITIO)}" target="_blank" rel="noopener">${iconos.google}<span><b>Google Calendar</b><span>Al guardar, active la alerta</span></span></a>`;
  abrirHoja(`
    <button class="volver" data-act="${a.id}">‹ Volver</button>
    <h2 id="hoja-titulo">Agregar al calendario</h2>
    <p class="cuando">${esc(a.titulo)}</p>
    <p class="donde">${fechaLarga(a.fecha)} · ${a.hora}</p>
    <div class="recordatorio">Le recordaremos <b>un día antes</b> y <b>2 horas antes</b>, para que llegue con tiempo.</div>
    ${so === 'android' ? goo + ios.replace('iPhone · Calendario', 'Otro calendario (.ics)') : ios + goo}
    <p class="nota">Google Calendar no siempre guarda los recordatorios: revise que la alerta esté activada.</p>
    <div class="enlaces"><a href="ics/destacados.ics">Agregar solo lo principal</a><a href="ics/todo.ics">Agregar todo el programa</a></div>`);
}

/* ---------- Gratitud ---------- */
function pintarGratitud(q = '') {
  const norm = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const nq = norm(q.trim());
  const marca = (n) => {
    if (!nq) return esc(n);
    const i = norm(n).indexOf(nq);
    return i < 0 ? esc(n) : esc(n.slice(0, i)) + '<mark>' + esc(n.slice(i, i + nq.length)) + '</mark>' + esc(n.slice(i + nq.length));
  };
  const chip = (n, ctx) => `<button class="nombre" data-gracias="${esc(n)}" data-ctx="${esc(ctx)}">${marca(n)}</button>`;
  const grupos = [];
  const pri = D.fiesta.priostes.filter((n) => !nq || norm(n).includes(nq));
  if (pri.length) grupos.push(`<article class="grupo priostes"><p class="ev">Priostes 2026</p><h3>Santísima Virgen de El Quinche</h3><div class="nombres">${pri.map((n) => chip(n, 'como Prioste de las fiestas 2026')).join('')}</div></article>`);
  for (const a of D.actividades) {
    const ns = a.gentileza.filter((n) => !nq || norm(n).includes(nq));
    if (!ns.length) continue;
    grupos.push(`<article class="grupo"><p class="ev">${fechaLarga(a.fecha)} · ${a.hora}</p><h3>${esc(a.titulo)}</h3><div class="nombres">${ns.map((n) => chip(n, `en «${a.titulo}»`)).join('')}</div></article>`);
  }
  $('#gratitud').innerHTML = grupos.join('') || `<p class="vacio">No encontramos ese nombre. Revise cómo está escrito o busque por apellido.</p>`;
}

/* ---------- Compartir ---------- */
async function compartir({ title, text, url }) {
  if (navigator.share) {
    try { await navigator.share({ title, text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
  }
  const wa = `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`;
  window.open(wa, '_blank', 'noopener');
}

function aviso(t) {
  const a = $('#aviso'); a.textContent = t; a.hidden = false;
  clearTimeout(aviso.t); aviso.t = setTimeout(() => { a.hidden = true; }, 2600);
}

/* ---------- Arranque ---------- */
function eventos() {
  document.addEventListener('click', (ev) => {
    const b = ev.target.closest('button, a');
    if (!b) return;
    if (b.dataset.ir) { ir(b.dataset.ir); return; }
    if (b.dataset.dia) { ui.dia = b.dataset.dia; pintarDias(); pintarLista(); window.scrollTo(0, 0); return; }
    if (b.dataset.filtro) { ui.filtro = b.dataset.filtro; pintarFiltros(); pintarLista(); return; }
    if (b.dataset.act) { detalle(b.dataset.act); return; }
    if (b.dataset.cal) { calendario(b.dataset.cal); return; }
    if (b.dataset.compartirAct) {
      const a = D.actividades.find((x) => x.id === b.dataset.compartirAct);
      compartir({ title: a.titulo, text: `${a.titulo} · ${fechaLarga(a.fecha)}, ${a.hora}. Fiestas de la Santísima Virgen de El Quinche, Río Blanco Alto.`, url: `${URL_SITIO}#a/${a.id}` });
      return;
    }
    if (b.dataset.gracias) {
      compartir({ title: 'Gracias', text: `Gracias, ${b.dataset.gracias}, por su gentileza ${b.dataset.ctx} en las fiestas de la Santísima Virgen de El Quinche, Río Blanco Alto 2026.`, url: URL_SITIO });
      return;
    }
    if (b.id === 'btn-compartir') {
      compartir({ title: 'Fiestas Río Blanco Alto 2026', text: 'Fiestas en honor a la Santísima Virgen de El Quinche · Río Blanco Alto, del 13 al 22 de noviembre. Vea el programa y agregue las actividades a su calendario:', url: URL_SITIO });
      return;
    }
    if (b.id === 'hoja-cerrar') cerrarHoja();
    if (b.closest('.opcion') || b.closest('.enlaces')) aviso('Abriendo su calendario…');
  });
  $('#velo').addEventListener('click', cerrarHoja);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#hoja').hidden) cerrarHoja(); });
  $('#buscar').addEventListener('input', (e) => pintarGratitud(e.target.value));
}

async function iniciar() {
  splash();
  $('#btn-compartir').innerHTML = iconos.compartir;
  $('#hoja-cerrar').innerHTML = iconos.cerrar;
  $('.buscador-icono').innerHTML = iconos.buscar;
  $$('[data-ico]').forEach((e) => { e.innerHTML = iconos[e.dataset.ico]; });
  $('#hero-virgen').innerHTML = virgen;
  $('#hero-cotopaxi').innerHTML = cotopaxi;

  D = await (await fetch('data/programa.json')).json();
  const hoy = diaEcuador(ahora());
  const ds = dias();
  ui.dia = ds.includes(hoy) ? hoy : (hoy < ds[0] ? ds[0] : ds[ds.length - 1]);

  pintarEstado(); pintarDias(); pintarFiltros(); pintarLista(); pintarGratitud();
  eventos();
  setInterval(() => { pintarEstado(); if (!$('#vista-programa').hidden) pintarLista(); }, 60000);

  const m = location.hash.match(/^#a\/(.+)$/);
  if (m && D.actividades.some((a) => a.id === m[1])) {
    ui.dia = D.actividades.find((a) => a.id === m[1]).fecha;
    pintarDias(); pintarLista(); ir('programa'); detalle(m[1]);
  }
}

iniciar();
