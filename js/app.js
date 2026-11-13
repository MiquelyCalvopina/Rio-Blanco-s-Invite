import { estado, inicioUTC, diaEcuador, horaEcuador, googleCalendarUrl } from './nucleo.js';
import { torito, iglesia, virgen, cotopaxi, iconos } from './ilustraciones.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const URL_SITIO = location.origin + location.pathname;
const TIPOS = { religioso: 'Religioso', cultural: 'Cultural', popular: 'Popular', deportivo: 'Deportivo' };
const DIAS_SEM = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const SO = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  ? 'ios' : /Android/i.test(navigator.userAgent) ? 'android' : 'otro';

let D;
const ui = { dia: null, filtro: 'todo' };

// Para pruebas: ?ahora=2026-11-14T18:20 (hora del Ecuador)
function ahora() {
  const p = new URLSearchParams(location.search).get('ahora');
  return p ? new Date(p + ':00-05:00') : new Date();
}

const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fechaLarga = (f) => { const d = new Date(f + 'T12:00:00Z'); return `${DIAS_SEM[d.getUTCDay()]} ${d.getUTCDate()} de ${MESES[d.getUTCMonth()]}`; };
const lugar = (a) => D.lugares[a.lugar];
const lugarTexto = (a) => (a.lugar === 'posada' ? a.detalle.replace(/\.$/, '') : lugar(a).nombre);
const actividad = (id) => D.actividades.find((x) => x.id === id);
const dias = () => [...new Set(D.actividades.map((a) => a.fecha))];

/* ---------- Agregados al calendario (solo en este teléfono) ---------- */
const agregados = new Set((() => { try { return JSON.parse(localStorage.getItem('agregados') || '[]'); } catch { return []; } })());
function marcarAgregado(id) {
  agregados.add(id);
  try { localStorage.setItem('agregados', JSON.stringify([...agregados])); } catch {}
}

/* ---------- Splash ---------- */
function prepararTrazos(cont, inicio, paso, dur) {
  $$('.trazo path', cont).forEach((p, i) => {
    p.style.setProperty('--l', Math.ceil(p.getTotalLength()) + 2);
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
function ir(vista) {
  for (const v of ['inicio', 'programa', 'gratitud']) $(`#vista-${v}`).hidden = v !== vista;
  $$('.tab').forEach((t) => (t.dataset.ir === vista ? t.setAttribute('aria-current', 'page') : t.removeAttribute('aria-current')));
  window.scrollTo(0, 0);
  if (vista === 'programa') $('.dia[aria-selected="true"]')?.scrollIntoView({ inline: 'center', block: 'nearest' });
}

/* ---------- Inicio ---------- */
function cuando(a) {
  const hoy = diaEcuador(ahora());
  const manana = diaEcuador(new Date(ahora().getTime() + 864e5));
  if (a.fecha === hoy) return a.hora;
  if (a.fecha === manana) return `Mañana ${a.hora}`;
  const d = new Date(a.fecha + 'T12:00:00Z');
  return `${DIAS_SEM[d.getUTCDay()].slice(0, 3)} ${d.getUTCDate()} · ${a.hora}`;
}

function tarjetaEstado(a, vivo) {
  return `<button class="tarjeta-estado" data-act="${a.id}">
    <span class="cuerpo">
      <span class="etq">${vivo ? '<i class="vivo"></i>En curso' : esc(cuando(a))}</span>
      <span class="tit">${esc(a.titulo)}</span>
      <span class="met">${esc(lugarTexto(a))}</span>
    </span>
    <span class="chev">${iconos.chev}</span></button>`;
}

function pintarEstado() {
  const e = estado(D.actividades, ahora());
  let html = '';
  if (e.fase === 'despues') {
    html = `<p class="seccion-t">Gracias</p><p class="estado-texto">Las fiestas de 2026 terminaron. Gracias por acompañar a Nuestra Patrona.</p>`;
  } else {
    if (e.ahora.length) html += `<p class="seccion-t">Ahora</p><div class="estado">${e.ahora.map((a) => tarjetaEstado(a, true)).join('')}</div>`;
    if (e.proximo) {
      const titulo = e.fase === 'antes' ? `Empieza en ${diasFaltan()}` : 'Lo próximo';
      html += `<p class="seccion-t">${titulo}</p><div class="estado">${tarjetaEstado(e.proximo, false)}</div>`;
    }
  }
  $('#estado').innerHTML = html;
}

function diasFaltan() {
  const d = Math.ceil((inicioUTC(D.actividades[0]).getTime() - ahora().getTime()) / 864e5);
  return d <= 1 ? 'pocas horas' : `${d} días`;
}

/* ---------- Programa ---------- */
function pintarDias() {
  const hoy = diaEcuador(ahora());
  const grandes = new Set(D.actividades.filter((a) => a.destacado).map((a) => a.fecha));
  $('#dias').innerHTML = dias().map((f) => {
    const d = new Date(f + 'T12:00:00Z');
    const cls = ['dia', grandes.has(f) ? 'grande' : '', f === hoy ? 'hoy-d' : ''].join(' ');
    return `<button class="${cls}" role="tab" data-dia="${f}" aria-selected="${f === ui.dia}" aria-label="${fechaLarga(f)}${f === hoy ? ', hoy' : ''}">
      ${f === hoy ? 'Hoy' : DIAS_SEM[d.getUTCDay()].slice(0, 3)}<b>${d.getUTCDate()}</b><i class="punto"></i></button>`;
  }).join('');
}

function pintarFiltros() {
  const ops = [['todo', 'Todo'], ...Object.entries(TIPOS)];
  $('#filtros').innerHTML = ops.map(([k, v]) => `<button class="chip" data-filtro="${k}" aria-pressed="${ui.filtro === k}">${v}</button>`).join('');
}

function filaAct(a) {
  const ok = agregados.has(a.id);
  return `<li class="fila">
    <button class="fila-main" data-act="${a.id}">
      <span class="hora">${a.hora}</span>
      <span class="cuerpo">
        <span class="tit">${esc(a.titulo)}${a.destacado ? '<span class="insignia">Principal</span>' : ''}</span>
        <span class="met"><i class="punto-t p-${a.tipo}"></i><span>${TIPOS[a.tipo]} · ${esc(lugarTexto(a))}</span></span>
      </span>
    </button>
    <button class="fila-cal${ok ? ' puesto' : ''}" data-agregar="${a.id}" aria-label="${ok ? 'Ya agregado' : 'Agregar al calendario'}: ${esc(a.titulo)}">${ok ? iconos.calOk : iconos.calMas}</button>
  </li>`;
}

const franja = (h) => (h < '12:00' ? 'Mañana' : h < '18:00' ? 'Tarde' : 'Noche');

function pintarLista() {
  const hoy = diaEcuador(ahora());
  const hora = horaEcuador(ahora());
  const delDia = D.actividades.filter((a) => a.fecha === ui.dia);
  const acts = delDia.filter((a) => ui.filtro === 'todo' || a.tipo === ui.filtro);
  $('#dia-titulo').textContent = fechaLarga(ui.dia);
  const n = delDia.length;
  $('#dia-resumen').textContent = `${n} ${n === 1 ? 'actividad' : 'actividades'}${ui.filtro !== 'todo' ? ` · ${acts.length} de tipo ${TIPOS[ui.filtro].toLowerCase()}` : ''}`;
  if (!acts.length) { $('#lista').innerHTML = `<li class="vacio">No hay actividades de este tipo este día.</li>`; return; }
  let pos = -1;
  if (ui.dia === hoy) { pos = acts.findIndex((a) => a.hora > hora); if (pos < 0) pos = acts.length; }
  const linea = `<li class="ahora-linea" id="ahora">Ahora · ${hora}</li>`;
  let html = ''; let f = '';
  acts.forEach((a, i) => {
    if (franja(a.hora) !== f) {
      f = franja(a.hora);
      if (i === pos && franja(hora) !== f) { html += linea; pos = -2; }
      html += `<li class="franja">${f === 'Noche' ? iconos.luna : iconos.sol}${f}</li>`;
    }
    if (i === pos) html += linea;
    html += filaAct(a);
  });
  if (pos === acts.length) html += linea;
  $('#lista').innerHTML = html;
}

/* ---------- Agregar al calendario ---------- */
function agregar(id) {
  const a = actividad(id);
  marcarAgregado(id);
  if (SO === 'android') {
    window.open(googleCalendarUrl(a, D.lugares, URL_SITIO), '_blank', 'noopener');
    aviso('Al guardar en Google Calendar, active la alerta.');
  } else {
    location.href = `ics/${a.id}.ics`;
    aviso('Con recordatorio 1 día antes y 2 horas antes.');
  }
  pintarLista();
  if (!$('#hoja').hidden && $('#hoja').dataset.id === id) detalle(id);
}

/* ---------- Hoja inferior ---------- */
function abrirHoja(html, id = '') {
  const h = $('#hoja');
  $('#hoja-contenido').innerHTML = html;
  h.dataset.id = id;
  if (h.hidden) { h.hidden = false; $('#velo').hidden = false; document.body.style.overflow = 'hidden'; }
  h.scrollTop = 0;
}
function cerrarHoja() {
  $('#hoja').hidden = true; $('#velo').hidden = true;
  document.body.style.overflow = '';
  if (location.hash.startsWith('#a/')) history.replaceState(null, '', location.pathname + location.search);
}

function detalle(id) {
  const a = actividad(id);
  if (!a) return;
  history.replaceState(null, '', `#a/${a.id}${location.search ? '' : ''}`);
  const l = lugar(a);
  const ok = agregados.has(a.id);
  const mapa = l.mapa ? `<a href="${l.mapa}" target="_blank" rel="noopener">Cómo llegar</a>` : '';
  const gent = a.gentileza.length
    ? `<li>${iconos.personas}<span>Gentileza de<span class="sub">${a.gentileza.map(esc).join(' · ')}</span></span></li>` : '';
  abrirHoja(`
    <p class="met-sup"><i class="punto-t p-${a.tipo}"></i>${TIPOS[a.tipo]}${a.destacado ? ' · Principal' : ''}</p>
    <h2 id="hoja-titulo">${esc(a.titulo)}</h2>
    <ul class="datos">
      <li>${iconos.reloj}<span>${fechaLarga(a.fecha)}<span class="sub">${a.hora}</span></span></li>
      <li>${iconos.mapa}<span>${esc(lugarTexto(a))}${a.lugar === 'posada' ? '<span class="sub">Casa particular</span>' : ''}</span>${mapa}</li>
      ${gent}
    </ul>
    ${a.detalle && a.lugar !== 'posada' ? `<p class="det">${esc(a.detalle)}</p>` : ''}
    ${a.queEs ? `<p class="quees"><b>Qué es: </b>${esc(a.queEs)}</p>` : ''}
    <div class="acciones">
      <button class="btn btn-noche" data-agregar="${a.id}">${ok ? iconos.calOk + 'Agregar de nuevo al calendario' : iconos.calMas + 'Agregar al calendario'}</button>
      <p class="ayuda">Recordatorio 1 día antes y 2 horas antes</p>
      <div class="acciones-sec">
        <button class="btn btn-borde" data-compartir-act="${a.id}">${iconos.compartir}Compartir</button>
        <button class="btn btn-borde" data-opciones="${a.id}">${iconos.calendario}Otras opciones</button>
      </div>
    </div>`, a.id);
}

function opciones(id) {
  const a = actividad(id);
  abrirHoja(`
    <button class="enlace" data-act="${a.id}">${iconos.atras} Volver</button>
    <h2 id="hoja-titulo">Agregar al calendario</h2>
    <div class="opciones">
      <a class="opcion" href="ics/${a.id}.ics" data-marcar="${a.id}">${iconos.calendario}<span>Calendario del iPhone u otro<span class="sub">Archivo .ics con 2 recordatorios</span></span></a>
      <a class="opcion" href="${googleCalendarUrl(a, D.lugares, URL_SITIO)}" target="_blank" rel="noopener" data-marcar="${a.id}">${iconos.google}<span>Google Calendar<span class="sub">Al guardar, active la alerta</span></span></a>
      <a class="opcion" href="ics/destacados.ics">${iconos.descargar}<span>Solo las actividades principales<span class="sub">${D.actividades.filter((x) => x.destacado).length} actividades, un solo archivo</span></span></a>
      <a class="opcion" href="ics/todo.ics">${iconos.descargar}<span>Todo el programa<span class="sub">${D.actividades.length} actividades, un solo archivo</span></span></a>
    </div>`, a.id);
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
  const fila = (n, ctx) => `<li class="nombre"><span>${marca(n)}</span><button data-gracias="${esc(n)}" data-ctx="${esc(ctx)}" aria-label="Compartir agradecimiento a ${esc(n)}">${iconos.compartir}</button></li>`;
  const grupos = [];
  const pri = D.fiesta.priostes.filter((n) => !nq || norm(n).includes(nq));
  if (pri.length) grupos.push(`<article class="grupo priostes"><div class="grupo-cab"><p class="ev">Priostes 2026</p><h3>Santísima Virgen de El Quinche</h3></div><ul class="nombres">${pri.map((n) => fila(n, 'como Prioste de las fiestas 2026')).join('')}</ul></article>`);
  for (const a of D.actividades) {
    const ns = a.gentileza.filter((n) => !nq || norm(n).includes(nq));
    if (!ns.length) continue;
    grupos.push(`<article class="grupo"><div class="grupo-cab"><p class="ev">${cuandoCompleto(a)}</p><h3>${esc(a.titulo)}</h3></div><ul class="nombres">${ns.map((n) => fila(n, `en «${a.titulo}»`)).join('')}</ul></article>`);
  }
  $('#gratitud').innerHTML = grupos.join('') || `<p class="vacio">No encontramos ese nombre. Pruebe solo con el apellido.</p>`;
}
const cuandoCompleto = (a) => `${fechaLarga(a.fecha)} · ${a.hora}`;

/* ---------- Compartir ---------- */
async function compartir({ title, text, url }) {
  if (navigator.share) {
    try { await navigator.share({ title, text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank', 'noopener');
}

function aviso(t) {
  const a = $('#aviso'); a.textContent = t; a.hidden = false;
  clearTimeout(aviso.t); aviso.t = setTimeout(() => { a.hidden = true; }, 3200);
}

/* ---------- Eventos ---------- */
function eventos() {
  document.addEventListener('click', (ev) => {
    const b = ev.target.closest('button, a');
    if (!b) return;
    const d = b.dataset;
    if (d.ir) return ir(d.ir);
    if (d.dia) { ui.dia = d.dia; pintarDias(); pintarLista(); window.scrollTo(0, 0); return; }
    if (d.filtro) { ui.filtro = d.filtro; pintarFiltros(); pintarLista(); return; }
    if (d.agregar) return agregar(d.agregar);
    if (d.act) return detalle(d.act);
    if (d.opciones) return opciones(d.opciones);
    if (d.marcar) { marcarAgregado(d.marcar); pintarLista(); return; }
    if (d.compartirAct) {
      const a = actividad(d.compartirAct);
      return compartir({ title: a.titulo, text: `${a.titulo} · ${fechaLarga(a.fecha)}, ${a.hora}. Fiestas de la Santísima Virgen de El Quinche, Río Blanco Alto.`, url: `${URL_SITIO}#a/${a.id}` });
    }
    if (d.gracias) {
      return compartir({ title: 'Gracias', text: `Gracias, ${d.gracias}, por su gentileza ${d.ctx} en las fiestas de la Santísima Virgen de El Quinche, Río Blanco Alto 2026.`, url: URL_SITIO });
    }
    if (b.id === 'btn-compartir') {
      return compartir({ title: 'Fiestas Río Blanco Alto 2026', text: 'Fiestas en honor a la Santísima Virgen de El Quinche · Río Blanco Alto, del 13 al 22 de noviembre. Vea el programa y agregue las actividades a su calendario:', url: URL_SITIO });
    }
    if (b.id === 'hoja-cerrar') cerrarHoja();
  });
  $('#velo').addEventListener('click', cerrarHoja);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#hoja').hidden) cerrarHoja(); });
  $('#buscar').addEventListener('input', (e) => pintarGratitud(e.target.value));
}

/* ---------- Arranque ---------- */
async function iniciar() {
  splash();
  $('#btn-compartir').innerHTML = iconos.compartir;
  $('#hoja-cerrar').innerHTML = iconos.cerrar;
  $('.buscador-icono').innerHTML = iconos.buscar;
  $$('[data-ico]').forEach((e) => { e.outerHTML = iconos[e.dataset.ico]; });
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
  if (m && actividad(m[1])) {
    ui.dia = actividad(m[1]).fecha;
    pintarDias(); pintarLista(); ir('programa'); detalle(m[1]);
  }
}

iniciar();
