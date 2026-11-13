import { estado, inicioUTC, diaEcuador, horaEcuador, googleCalendarUrl } from './nucleo.js';
import { torito, iglesia, virgen, iconos, iconosAct } from './ilustraciones.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const URL_SITIO = location.origin + location.pathname;
const TIPOS = { religioso: 'Religioso', cultural: 'Cultural', popular: 'Popular', deportivo: 'Deportivo' };
const DIAS_SEM = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// Sistema del teléfono: define cómo se agrega al calendario.
const SO = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  ? 'ios' : /Android/i.test(navigator.userAgent) ? 'android' : 'otro';
const TEXTO_CAL = {
  ios: { boton: 'Agregar a mi calendario', ayuda: 'Se abre el Calendario del iPhone. Toque «Agregar» y quedará con aviso 1 día antes y 2 horas antes.', aviso: 'Toque «Agregar» en la ventana del Calendario.' },
  android: { boton: 'Agregar a Google Calendar', ayuda: 'Se abre Google Calendar. Toque «Guardar» y revise que tenga una notificación.', aviso: 'En Google Calendar, toque «Guardar».' },
  otro: { boton: 'Descargar para mi calendario', ayuda: 'Se descarga un archivo .ics con aviso 1 día antes y 2 horas antes. Ábralo para guardarlo.', aviso: 'Abra el archivo descargado para guardarlo.' },
}[SO];

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
const tile = (a, extra = '') => `<span class="tile k-${a.tipo} ${extra}">${iconosAct[a.icono] || ''}</span>`;

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
const VISTAS = ['inicio', 'programa', 'lugares', 'gratitud'];
function ir(vista) {
  for (const v of VISTAS) $(`#vista-${v}`).hidden = v !== vista;
  $$('.tab').forEach((t) => (t.dataset.ir === vista ? t.setAttribute('aria-current', 'page') : t.removeAttribute('aria-current')));
  window.scrollTo(0, 0);
  if (vista === 'programa') $('.dia[aria-selected="true"]')?.scrollIntoView({ inline: 'center', block: 'nearest' });
  if (vista === 'lugares') mapa();
  fabVisible();
}

// En el inicio, el botón flotante aparece cuando ya pasó el botón principal (para no taparlo).
let ctaVisible = true;
function fabVisible() {
  const enInicio = !$('#vista-inicio').hidden;
  $('#fab').classList.toggle('oculto', enInicio && ctaVisible);
}
function observarCta() {
  if (!('IntersectionObserver' in window)) return;
  new IntersectionObserver(([e]) => { ctaVisible = e.isIntersecting; fabVisible(); }, { rootMargin: '0px 0px -80px 0px' })
    .observe($('.hero .btn-oro'));
}

/* ---------- Inicio ---------- */
function cuando(a) {
  const hoy = diaEcuador(ahora());
  const manana = diaEcuador(new Date(ahora().getTime() + 864e5));
  if (a.fecha === hoy) return `Hoy · ${a.hora}`;
  if (a.fecha === manana) return `Mañana · ${a.hora}`;
  const d = new Date(a.fecha + 'T12:00:00Z');
  return `${DIAS_SEM[d.getUTCDay()]} ${d.getUTCDate()} · ${a.hora}`;
}

function tarjetaEstado(a, vivo) {
  return `<button class="tarjeta-estado" data-act="${a.id}">
    ${tile(a)}
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
      const t = e.fase === 'antes' ? `Empieza en ${diasFaltan()}` : 'Lo próximo';
      html += `<p class="seccion-t">${t}</p><div class="estado">${tarjetaEstado(e.proximo, false)}</div>`;
    }
  }
  $('#estado').innerHTML = html;
}

function diasFaltan() {
  const d = Math.ceil((inicioUTC(D.actividades[0]).getTime() - ahora().getTime()) / 864e5);
  return d <= 1 ? 'pocas horas' : `${d} días`;
}

function pintarPriostes() {
  $('#lista-priostes').innerHTML = D.fiesta.priostes.map((n) => `<li>${esc(n)}</li>`).join('');
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
  $('#filtros').innerHTML = ops.map(([k, v]) => `<button class="chip" data-filtro="${k}" aria-pressed="${ui.filtro === k}">${k !== 'todo' ? `<i class="k-${k}" style="background:var(--${k})"></i>` : ''}${v}</button>`).join('');
}

function filaAct(a) {
  const ok = agregados.has(a.id);
  return `<li class="fila">
    <button class="fila-main" data-act="${a.id}">
      ${tile(a)}
      <span class="cuerpo">
        <span class="tit">${esc(a.titulo)}</span>
        <span class="met"><b>${a.hora}</b> · ${esc(lugarTexto(a))}${a.destacado ? ' · <span class="principal">Principal</span>' : ''}</span>
      </span>
    </button>
    <button class="fila-cal${ok ? ' puesto' : ''}" data-agregar="${a.id}" aria-label="${ok ? 'Ya está en su calendario' : 'Agregar al calendario'}: ${esc(a.titulo)}">${ok ? iconos.calOk : iconos.calMas}</button>
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
  $('#dia-resumen').textContent = ui.filtro === 'todo'
    ? `${n} ${n === 1 ? 'actividad' : 'actividades'}`
    : `${acts.length} de ${n} actividades · ${TIPOS[ui.filtro]}`;
  if (!acts.length) { $('#lista').innerHTML = `<li class="vacio">Este día no hay actividades de tipo ${TIPOS[ui.filtro].toLowerCase()}.</li>`; return; }
  let pos = -1;
  if (ui.dia === hoy) { pos = acts.findIndex((a) => a.hora > hora); if (pos < 0) pos = acts.length; }
  const linea = `<li class="ahora-linea" id="ahora">Ahora · ${hora}</li>`;
  let html = ''; let f = '';
  acts.forEach((a, i) => {
    if (franja(a.hora) !== f) {
      if (i === pos && franja(hora) === f) { html += linea; pos = -2; }
      f = franja(a.hora);
      html += `<li class="franja">${f === 'Noche' ? iconos.luna : iconos.sol}${f}</li>`;
    }
    if (i === pos) html += linea;
    html += filaAct(a);
  });
  if (pos === acts.length) html += linea;
  $('#lista').innerHTML = html;
}

/* ---------- Agregar al calendario (según el teléfono) ---------- */
function agregar(id) {
  const a = actividad(id);
  marcarAgregado(id);
  if (SO === 'android') window.open(googleCalendarUrl(a, D.lugares, URL_SITIO), '_blank', 'noopener');
  else location.href = `ics/${a.id}.ics`;
  aviso(TEXTO_CAL.aviso);
  pintarLista();
  if (!$('#hoja').hidden && $('#hoja').dataset.id === id && $('#hoja').dataset.modo === 'detalle') detalle(id);
}

/* ---------- Hoja inferior ---------- */
function abrirHoja(html, id = '', modo = '') {
  const h = $('#hoja');
  $('#hoja-contenido').innerHTML = html;
  h.dataset.id = id; h.dataset.modo = modo;
  if (h.hidden) { h.hidden = false; $('#velo').hidden = false; $('#fab').hidden = true; document.body.style.overflow = 'hidden'; }
  h.scrollTop = 0;
}
function cerrarHoja() {
  $('#hoja').hidden = true; $('#velo').hidden = true; $('#fab').hidden = false;
  document.body.style.overflow = '';
  if (location.hash.startsWith('#a/')) history.replaceState(null, '', location.pathname + location.search);
}

function detalle(id) {
  const a = actividad(id);
  if (!a) return;
  history.replaceState(null, '', `${location.search}#a/${a.id}`);
  const l = lugar(a);
  const ok = agregados.has(a.id);
  const mapa = l.mapa ? `<a href="${l.mapa}" target="_blank" rel="noopener">Cómo llegar</a>` : '';
  const gent = a.gentileza.length ? `<li>${iconos.personas}<span>Gentileza de<span class="sub">${a.gentileza.map(esc).join(' · ')}</span></span></li>` : '';
  abrirHoja(`
    <div class="hoja-top">${tile(a, 'grande')}<div><p class="met-sup">${TIPOS[a.tipo]}${a.destacado ? ' · Principal' : ''}</p><h2 id="hoja-titulo">${esc(a.titulo)}</h2></div></div>
    <ul class="datos">
      <li>${iconos.reloj}<span>${fechaLarga(a.fecha)}<span class="sub">${a.hora}</span></span></li>
      <li>${iconos.mapa}<span>${esc(lugarTexto(a))}${a.lugar === 'posada' ? '<span class="sub">Casa particular</span>' : ''}</span>${mapa}</li>
      ${gent}
    </ul>
    ${a.detalle && a.lugar !== 'posada' ? `<p class="det">${esc(a.detalle)}</p>` : ''}
    ${a.queEs ? `<p class="quees"><b>Qué es: </b>${esc(a.queEs)}</p>` : ''}
    <div class="pie-hoja">
      <button class="btn btn-noche" data-agregar="${a.id}">${ok ? iconos.calOk : iconos.calMas}${ok ? 'Ya está en su calendario' : TEXTO_CAL.boton}</button>
      <p class="ayuda">${TEXTO_CAL.ayuda}</p>
      <div class="acciones-sec">
        <button class="btn btn-borde" data-compartir-act="${a.id}">${iconos.compartir}Compartir</button>
        <button class="btn btn-borde" data-opciones="${a.id}">${iconos.calendario}Otro calendario</button>
      </div>
    </div>`, a.id, 'detalle');
}

function opciones(id) {
  const a = actividad(id);
  const ndest = D.actividades.filter((x) => x.destacado).length;
  abrirHoja(`
    <button class="enlace" data-act="${a.id}">${iconos.atras}Volver</button>
    <h2 id="hoja-titulo">Elija su calendario</h2>
    <div class="opciones">
      <a class="opcion" href="ics/${a.id}.ics" data-marcar="${a.id}">${iconos.calendario}<span>iPhone, Samsung u Outlook<span class="sub">Esta actividad · archivo .ics</span></span><span class="rec">Con avisos</span></a>
      <a class="opcion" href="${googleCalendarUrl(a, D.lugares, URL_SITIO)}" target="_blank" rel="noopener" data-marcar="${a.id}">${iconos.google}<span>Google Calendar<span class="sub">Esta actividad · active la notificación</span></span></a>
      <a class="opcion" href="ics/destacados.ics">${iconos.descargar}<span>Solo las actividades principales<span class="sub">${ndest} actividades en un archivo .ics</span></span><span class="rec">Con avisos</span></a>
      <a class="opcion" href="ics/todo.ics">${iconos.descargar}<span>Todo el programa<span class="sub">${D.actividades.length} actividades en un archivo .ics</span></span><span class="rec">Con avisos</span></a>
    </div>`, a.id, 'opciones');
}

/* ---------- Lugares (mapa) ---------- */
let mapaListo = false;
function cargar(src, tipo) {
  return new Promise((res, rej) => {
    const e = document.createElement(tipo === 'css' ? 'link' : 'script');
    if (tipo === 'css') { e.rel = 'stylesheet'; e.href = src; } else { e.src = src; }
    e.onload = res; e.onerror = rej; document.head.appendChild(e);
  });
}
function lugaresUsados() {
  const cuenta = {};
  for (const a of D.actividades) if (a.lugar !== 'posada') cuenta[a.lugar] = (cuenta[a.lugar] || 0) + 1;
  return cuenta;
}
function pintarLugares() {
  const cuenta = lugaresUsados();
  const orden = Object.keys(cuenta).sort((x, y) => cuenta[y] - cuenta[x]);
  $('#lista-lugares').innerHTML = orden.map((k) => {
    const l = D.lugares[k];
    const extra = k === 'estadio' ? ' · con parqueadero' : '';
    return `<li class="lugar"><span class="tile k-religioso">${iconosAct[l.icono] || iconos.mapa}</span>
      <span class="cuerpo"><span class="tit">${esc(l.nombre)}</span><span class="met">${cuenta[k]} ${cuenta[k] === 1 ? 'actividad' : 'actividades'}${extra}</span></span>
      ${l.mapa ? `<a href="${l.mapa}" target="_blank" rel="noopener">Cómo llegar</a>` : ''}</li>`;
  }).join('');
}
async function mapa() {
  if (mapaListo) return;
  mapaListo = true;
  try {
    await cargar('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css', 'css');
    await cargar('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js', 'js');
  } catch { $('#mapa').hidden = true; return; }
  const L = window.L;
  const m = L.map('mapa', { zoomControl: false, attributionControl: true, scrollWheelZoom: false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(m);
  const puntos = {};
  for (const [k, l] of Object.entries(D.lugares)) {
    if (l.lat == null) continue;
    const clave = `${l.lat},${l.lng}`;
    (puntos[clave] = puntos[clave] || { l, nombres: [] }).nombres.push(l.nombre);
  }
  const grupo = [];
  for (const { l, nombres } of Object.values(puntos)) {
    const icon = L.divIcon({ className: '', html: `<span class="pin k-cultural" style="background:var(--colcha);color:#fff">${iconosAct[l.icono] || ''}</span>`, iconSize: [36, 36], iconAnchor: [18, 36] });
    L.marker([l.lat, l.lng], { icon, title: nombres.join(' y ') }).addTo(m)
      .bindPopup(`<b>${esc(nombres.join(' y '))}</b><br><a href="${l.mapa}" target="_blank" rel="noopener">Cómo llegar</a>`);
    grupo.push([l.lat, l.lng]);
  }
  m.fitBounds(grupo, { padding: [40, 40], maxZoom: 18 });
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
  if (pri.length) grupos.push(`<article class="grupo"><div class="grupo-cab"><span class="tile k-religioso">${iconosAct.estandarte}</span><div><span class="ev">Toda la fiesta</span><h3>Priostes 2026</h3></div></div><ul class="nombres">${pri.map((n) => fila(n, 'como Prioste de las fiestas 2026')).join('')}</ul></article>`);
  for (const a of D.actividades) {
    const ns = a.gentileza.filter((n) => !nq || norm(n).includes(nq));
    if (!ns.length) continue;
    grupos.push(`<article class="grupo"><div class="grupo-cab">${tile(a)}<div><span class="ev">${fechaLarga(a.fecha)} · ${a.hora}</span><h3>${esc(a.titulo)}</h3></div></div><ul class="nombres">${ns.map((n) => fila(n, `en «${a.titulo}»`)).join('')}</ul></article>`);
  }
  $('#gratitud').innerHTML = grupos.join('') || `<p class="vacio">No encontramos ese nombre. Pruebe solo con el apellido.</p>`;
}

/* ---------- Compartir ---------- */
async function compartir({ title, text, url }) {
  if (navigator.share) {
    try { await navigator.share({ title, text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank', 'noopener');
}

function aviso(t) {
  const a = $('#aviso'); a.textContent = t; a.hidden = false;
  clearTimeout(aviso.t); aviso.t = setTimeout(() => { a.hidden = true; }, 3500);
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
    if (b.id === 'fab') {
      return compartir({ title: 'Fiestas Río Blanco Alto 2026', text: 'Les invitamos a las fiestas en honor a la Santísima Virgen de El Quinche en Río Blanco Alto, del 13 al 22 de noviembre. Aquí está el programa completo:', url: URL_SITIO });
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
  $('#hoja-cerrar').innerHTML = iconos.cerrar;
  $('.buscador-icono').innerHTML = iconos.buscar;
  $$('[data-ico]').forEach((e) => { e.outerHTML = iconos[e.dataset.ico]; });
  $$('[data-ico-act]').forEach((e) => { e.innerHTML = iconosAct[e.dataset.icoAct]; });
  $('#hero-virgen').innerHTML = virgen;

  D = await (await fetch('data/programa.json')).json();
  const hoy = diaEcuador(ahora());
  const ds = dias();
  ui.dia = ds.includes(hoy) ? hoy : (hoy < ds[0] ? ds[0] : ds[ds.length - 1]);

  pintarEstado(); pintarPriostes(); pintarDias(); pintarFiltros(); pintarLista(); pintarLugares(); pintarGratitud();
  eventos();
  observarCta(); fabVisible();
  setInterval(() => { pintarEstado(); if (!$('#vista-programa').hidden) pintarLista(); }, 60000);

  const m = location.hash.match(/^#a\/(.+)$/);
  if (m && actividad(m[1])) {
    ui.dia = actividad(m[1]).fecha;
    pintarDias(); pintarLista(); ir('programa'); detalle(m[1]);
  }
}

iniciar();
