import { estado, inicioUTC, diaEcuador, horaEcuador, googleCalendarUrl } from './nucleo.js';
import { iglesia, virgen, iconos, iconosAct } from './ilustraciones.js';

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
  ios: { boton: 'Agregar a mi calendario', aviso: 'Toque «Agregar» para guardarlo' },
  android: { boton: 'Agregar a Google Calendar', aviso: 'Toque «Guardar» en Google Calendar' },
  otro: { boton: 'Agregar a mi calendario', aviso: 'Abra el archivo para guardarlo' },
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
const lugarTexto = (a) => (a.lugar === 'posada' ? `Posada de ${a.anfitrion}` : lugar(a).nombre);
const actividad = (id) => D.actividades.find((x) => x.id === id);
const dias = () => [...new Set(D.actividades.map((a) => a.fecha))];
const ic = (a) => `<span class="ic c-${a.tipo}">${iconosAct[a.icono] || ''}</span>`;
const icPeq = (a) => `<span class="c-${a.tipo}">${iconosAct[a.icono] || ''}</span>`;
const FOTOS = { plaza: 'img/lugares/plaza.jpg', plazaToros: 'img/lugares/plaza.jpg', barrio: 'img/lugares/cotopaxi.jpg' };

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
  $('#splash-ilus').innerHTML = iglesia;
  if (!reducido) prepararTrazos($('#splash-ilus'), 0, 0.08, 0.7);
  const t1 = setTimeout(() => s.classList.add('textos'), reducido ? 0 : 1100);
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
const TITULOS = { inicio: 'Río Blanco Alto · 2026', programa: 'Programa', lugares: 'Mapa del barrio', gratitud: 'Gratitud' };
let vistaActual = 'inicio';
function ir(vista) {
  $$('.tab').forEach((t) => (t.dataset.ir === vista ? t.setAttribute('aria-current', 'page') : t.removeAttribute('aria-current')));
  $('#titulo-barra').textContent = TITULOS[vista];
  $('#atras').hidden = vista === 'inicio';
  if (vista === vistaActual) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  const antes = $(`#vista-${vistaActual}`);
  const despues = $(`#vista-${vista}`);
  vistaActual = vista;
  antes.classList.remove('entra'); antes.classList.add('sale');
  setTimeout(() => {
    antes.hidden = true; antes.classList.remove('sale');
    despues.hidden = false; despues.classList.remove('entra'); void despues.offsetWidth; despues.classList.add('entra');
    window.scrollTo(0, 0);
    if (vista === 'programa') $('.dia[aria-selected="true"]')?.scrollIntoView({ inline: 'center', block: 'nearest' });
    if (vista === 'lugares') mapa();
    fabVisible();
  }, 150);
}

// En el inicio, el botón flotante aparece cuando ya pasó el botón principal (para no taparlo).
let ctaVisible = true;
function fabVisible() {
  const enInicio = !$('#vista-inicio').hidden;
  const enMapa = !$('#vista-lugares').hidden; // en el mapa la acción principal es Llegar al barrio
  $('#fab').classList.toggle('oculto', (enInicio && ctaVisible) || enMapa);
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
  return `<button class="item tap-suave" data-act="${a.id}">
    ${ic(a)}
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
    html = `<h2 class="bloque-t">Gracias</h2><p class="estado-texto">Las fiestas de 2026 terminaron. Gracias por acompañar a Nuestra Patrona.</p>`;
  } else {
    const t = e.fase === 'antes' ? `Empieza en ${diasFaltan()}` : 'Qué está pasando';
    html += `<h2 class="bloque-t">${t}</h2><div class="estado">${e.ahora.map((a) => tarjetaEstado(a, true)).join('')}${e.proximo ? tarjetaEstado(e.proximo, false) : ''}</div>`;
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
      ${f === hoy ? 'Hoy' : DIAS_SEM[d.getUTCDay()].slice(0, 3)}<b>${d.getUTCDate()}</b></button>`;
  }).join('');
}

function pintarFiltros() {
  const ops = [['todo', 'Todo'], ...Object.entries(TIPOS)];
  $('#filtros').innerHTML = ops.map(([k, v]) => `<button class="chip" data-filtro="${k}" aria-pressed="${ui.filtro === k}">${k !== 'todo' ? `<i class="k-${k}" style="background:var(--${k})"></i>` : ''}${v}</button>`).join('');
}

function filaAct(a, enCurso) {
  return `<li class="fila${enCurso ? ' en-curso' : ''}">
    <button class="fila-main tap-suave" data-act="${a.id}">
      <span class="hora">${a.hora}</span>
      <span class="cuerpo">
        ${enCurso ? '<span class="en-curso-etq"><i class="vivo"></i>En curso</span>' : ''}
        <span class="tit">${esc(a.titulo)}${a.destacado ? '<span class="principal">Principal</span>' : ''}</span>
        <span class="met">${icPeq(a)}<span>${esc(lugarTexto(a))}</span></span>
      </span>
      <span class="chev">${iconos.chev}</span>
    </button>
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
  const linea = `<li class="ahora-linea" id="ahora"><span class="pill">Ahora · ${hora}</span></li>`;
  const enCurso = new Set(estado(D.actividades, ahora()).ahora.map((x) => x.id));
  let html = ''; let f = '';
  acts.forEach((a, i) => {
    if (franja(a.hora) !== f) {
      if (i === pos && franja(hora) === f) { html += linea; pos = -2; }
      f = franja(a.hora);
      html += `<li class="franja">${f === 'Noche' ? iconos.luna : iconos.sol}${f}</li>`;
    }
    if (i === pos) html += linea;
    html += filaAct(a, enCurso.has(a.id));
  });
  if (pos === acts.length) html += linea;
  const l = $('#lista');
  l.classList.remove('escalonado'); l.innerHTML = html;
  [...l.children].forEach((li, i) => li.style.setProperty('--i', Math.min(i, 12)));
  void l.offsetWidth; l.classList.add('escalonado');
}

/* ---------- Agregar al calendario (según el teléfono) ---------- */
function agregar(id) {
  const a = actividad(id);
  marcarAgregado(id);
  if (SO === 'android') window.open(googleCalendarUrl(a, D.lugares, URL_SITIO), '_blank', 'noopener');
  else location.href = `ics/${a.id}.ics`;
  aviso(TEXTO_CAL.aviso);
  if (!$('#hoja').hidden && $('#hoja').dataset.id === id && $('#hoja').dataset.modo === 'detalle') detalle(id);
}

/* ---------- Hoja inferior ---------- */
function abrirHoja(html, id = '', modo = '', conFoto = false) {
  const h = $('#hoja');
  h.classList.toggle('con-foto', conFoto);
  $('#hoja-contenido').innerHTML = html;
  h.dataset.id = id; h.dataset.modo = modo;
  if (h.hidden) { h.hidden = false; $('#velo').hidden = false; $('#fab').hidden = true; document.body.style.overflow = 'hidden'; }
  h.scrollTop = 0;
}
function cerrarHoja() {
  const h = $('#hoja'); const v = $('#velo');
  if (h.hidden || h.classList.contains('sale')) return;
  h.classList.add('sale'); v.classList.add('sale');
  setTimeout(() => { h.hidden = true; v.hidden = true; h.classList.remove('sale'); v.classList.remove('sale'); $('#fab').hidden = false; }, 230);
  document.body.style.overflow = '';
  if (location.hash.startsWith('#a/')) history.replaceState(null, '', location.pathname + location.search);
}

// Plantilla única para todas las actividades (mismo orden y mismas secciones):
// cabecera → título → fecha → descripción → dónde → a cargo de → gracias a
function detalle(id) {
  const a = actividad(id);
  if (!a) return;
  history.replaceState(null, '', `${location.search}#a/${a.id}`);
  const l = lugar(a);
  const ok = agregados.has(a.id);
  const src = a.foto || FOTOS[a.lugar];
  const info = a.credito
    ? `<button class="info-foto" data-info aria-label="Créditos de la foto">${iconos.info}</button>
       <a class="credito" href="${a.credito.url}" target="_blank" rel="noopener" hidden>Foto: ${esc(a.credito.autor)} · ${a.credito.licencia}</a>` : '';
  const cabecera = src
    ? `<div class="hoja-cab"><img class="hoja-foto" src="${src}" alt="">${info}</div>`
    : `<div class="hoja-cab portada k-${a.tipo}">${iconosAct[a.icono] || ''}</div>`;
  const fila = (icono, etiqueta, valor, extra = '') => `<li>${icono}<span><span class="etq-dato">${etiqueta}</span>${valor}</span>${extra}</li>`;
  const donde = a.lugar === 'posada'
    ? fila(iconos.mapa, 'Dónde', `Posada de ${esc(a.anfitrion)}<span class="sub">Casa particular</span>`)
    : fila(iconos.mapa, 'Dónde', esc(l.nombre), l.mapa ? `<a href="${l.mapa}" target="_blank" rel="noopener">Cómo llegar</a>` : '');
  abrirHoja(`${cabecera}
    <h2 id="hoja-titulo">${esc(a.titulo)}</h2>
    <p class="fecha-det">${iconos.reloj}${fechaLarga(a.fecha)} · ${a.hora}</p>
    ${a.descripcion ? `<p class="det">${esc(a.descripcion)}</p>` : ''}
    <ul class="datos">
      ${donde}
      ${a.aCargo ? fila(iconosAct.personas, 'A cargo de', esc(a.aCargo)) : ''}
      ${a.gentileza.length ? fila(iconos.personas, 'Gracias a', a.gentileza.map(esc).join(' · ')) : ''}
    </ul>
    <button class="enlace" data-opciones="${a.id}">Usar otro calendario</button>
    <div class="pie-hoja">
      <div class="pie-acciones">
        <button class="btn btn-noche tap" data-agregar="${a.id}">${ok ? iconos.calOk : iconos.calMas}${ok ? 'Agregado a su calendario' : TEXTO_CAL.boton}</button>
        <button class="btn btn-borde tap" data-compartir-act="${a.id}" aria-label="Compartir esta actividad">${iconos.compartir}Compartir</button>
      </div>
    </div>`, a.id, 'detalle', true);
}

function opciones(id) {
  const a = actividad(id);
  const ndest = D.actividades.filter((x) => x.destacado).length;
  abrirHoja(`
    <button class="enlace" data-act="${a.id}">${iconos.atras}Volver</button>
    <h2 id="hoja-titulo">Elija su calendario</h2>
    <div class="opciones">
      <a class="opcion tap-suave" href="ics/${a.id}.ics" data-marcar="${a.id}">${iconos.calendario}<span>iPhone, Samsung u Outlook<span class="sub">Esta actividad · archivo .ics</span></span><span class="rec">Con avisos</span></a>
      <a class="opcion tap-suave" href="${googleCalendarUrl(a, D.lugares, URL_SITIO)}" target="_blank" rel="noopener" data-marcar="${a.id}">${iconos.google}<span>Google Calendar<span class="sub">Esta actividad · active la notificación</span></span></a>
      <a class="opcion tap-suave" href="ics/destacados.ics">${iconos.descargar}<span>Solo las actividades principales<span class="sub">${ndest} actividades en un archivo .ics</span></span><span class="rec">Con avisos</span></a>
      <a class="opcion tap-suave" href="ics/todo.ics">${iconos.descargar}<span>Todo el programa<span class="sub">${D.actividades.length} actividades en un archivo .ics</span></span><span class="rec">Con avisos</span></a>
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
const SRV_ICO = { parqueo: 'parqueo', banos: 'banos', comida: 'comida' };
const pinSrv = (tipo) => `<span class="pin-srv s-${tipo}">${iconos[SRV_ICO[tipo]]}</span>`;
let mapaL = null; const marcadores = {};

function pintarLugares() {
  const ll = D.llegada;
  $('#llegar').href = `https://www.google.com/maps/dir/?api=1&destination=${ll.lat}%2C${ll.lng}`;
  $('#lista-servicios').innerHTML = D.servicios.map((x) => `<li><div class="srv-fila">
      <button class="srv tap-suave" data-ver="${x.id}">
        <span class="ic s-${x.tipo}">${iconos[SRV_ICO[x.tipo]]}</span>
        <span class="cuerpo"><span class="tit">${esc(x.nombre)}</span><span class="met">${esc(x.detalle)}</span></span>
      </button>
      <a class="ir" href="${x.mapa}" target="_blank" rel="noopener">Ir</a></div></li>`).join('');
  const usados = new Set(D.actividades.map((a) => a.lugar));
  const vistos = new Set();
  $('#lista-lugares').innerHTML = Object.entries(D.lugares)
    .filter(([k, l]) => l.lat != null && usados.has(k) && !vistos.has(`${l.lat},${l.lng}`) && vistos.add(`${l.lat},${l.lng}`))
    .map(([k, l]) => `<li><div class="srv-fila">
      <button class="srv tap-suave" data-ver="${k}">
        <span class="ic s-lugar">${iconosAct[l.icono] || iconos.mapa}</span>
        <span class="cuerpo"><span class="tit">${esc(l.corto && k === 'plaza' ? 'Plaza central y plaza de toros' : l.nombre)}</span></span>
      </button>
      <a class="ir" href="${l.mapa}" target="_blank" rel="noopener">Ir</a></div></li>`).join('');
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
  mapaL = m;
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(m);
  const grupo = [];
  // Tramo de las carpas de comida
  for (const x of D.servicios) if (x.tramo) L.polyline(x.tramo, { color: '#DE7A2C', weight: 6, opacity: .75, lineCap: 'round' }).addTo(m);
  // Lugares de la fiesta (un punto por coordenada)
  const vistos = {};
  for (const [k, l] of Object.entries(D.lugares)) {
    if (l.lat == null) continue;
    const clave = `${l.lat},${l.lng}`;
    if (vistos[clave]) { marcadores[k] = vistos[clave]; continue; }
    const icon = L.divIcon({ className: '', html: `<span class="pin"></span><span class="pin-etq">${esc(l.corto || l.nombre)}</span>`, iconSize: [14, 14], iconAnchor: [7, 7] });
    const mk = L.marker([l.lat, l.lng], { icon, title: l.nombre }).addTo(m)
      .bindPopup(`<b>${esc(l.nombre)}</b><br><a href="${l.mapa}" target="_blank" rel="noopener">Cómo llegar</a>`);
    vistos[clave] = mk; marcadores[k] = mk; grupo.push([l.lat, l.lng]);
  }
  // Servicios (agrupados si comparten punto)
  const porPunto = {};
  for (const x of D.servicios) (porPunto[`${x.lat},${x.lng}`] = porPunto[`${x.lat},${x.lng}`] || []).push(x);
  for (const xs of Object.values(porPunto)) {
    const x = xs[0];
    const icon = L.divIcon({ className: '', html: `<span class="pin-grupo">${xs.map((y) => pinSrv(y.tipo)).join('')}</span>`, iconSize: [28 * xs.length, 26], iconAnchor: [-6, 30] });
    const mk = L.marker([x.lat, x.lng], { icon, title: xs.map((y) => y.nombre).join(' y ') }).addTo(m)
      .bindPopup(xs.map((y) => `<b>${esc(y.nombre)}</b><br>${esc(y.detalle)}`).join('<br><br>') + `<br><a href="${x.mapa}" target="_blank" rel="noopener">Cómo llegar</a>`);
    for (const y of xs) marcadores[y.id] = mk;
    grupo.push([x.lat, x.lng]);
  }
  m.fitBounds(grupo, { paddingTopLeft: [30, 30], paddingBottomRight: [30, 70], maxZoom: 18 });
  setTimeout(() => m.invalidateSize(), 50);
}

function verEnMapa(id) {
  const mk = marcadores[id];
  if (!mapaL || !mk) return;
  mapaL.flyTo(mk.getLatLng(), 18, { duration: .6 });
  setTimeout(() => mk.openPopup(), 650);
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
  if (pri.length) grupos.push(`<article class="grupo"><div class="grupo-cab"><div><span class="ev">Toda la fiesta</span><h3>Priostes 2026</h3></div></div><ul class="nombres">${pri.map((n) => fila(n, 'como Prioste de las fiestas 2026')).join('')}</ul></article>`);
  for (const a of D.actividades) {
    const ns = a.gentileza.filter((n) => !nq || norm(n).includes(nq));
    if (!ns.length) continue;
    grupos.push(`<article class="grupo"><div class="grupo-cab"><div><span class="ev">${fechaLarga(a.fecha)} · ${a.hora}</span><h3>${esc(a.titulo)}</h3></div></div><ul class="nombres">${ns.map((n) => fila(n, `en «${a.titulo}»`)).join('')}</ul></article>`);
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
  const a = $('#aviso'); a.textContent = t; a.classList.remove('sale'); a.hidden = false;
  clearTimeout(aviso.t); clearTimeout(aviso.t2);
  aviso.t = setTimeout(() => { a.classList.add('sale'); aviso.t2 = setTimeout(() => { a.hidden = true; }, 200); }, 3500);
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
    if (d.ver) return verEnMapa(d.ver);
    if ('info' in d) { const c = b.parentElement.querySelector('.credito'); c.hidden = !c.hidden; return; }
    if (d.marcar) { marcarAgregado(d.marcar); return; }
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
