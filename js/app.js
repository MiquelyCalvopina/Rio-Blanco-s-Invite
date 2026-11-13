import { estado, inicioUTC, diaEcuador, horaEcuador, googleCalendarUrl, normalizar, buscarActividades, reconocimientos } from './nucleo.js?v=202611132148';
import { toro, virgen, iconos, iconosAct } from './ilustraciones.js?v=202611132148';

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
  ios: { boton: 'Agregar a mi calendario' },
  android: { boton: 'Agregar a Google Calendar' },
  otro: { boton: 'Agregar a mi calendario' },
}[SO];

let D;
const ui = { dia: null, filtro: 'todo', gdia: '' };

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
const FOTOS = { iglesia: 'img/lugares/iglesia.jpg', plaza: 'img/lugares/plaza.jpg', plazaToros: 'img/lugares/plaza.jpg', barrio: 'img/lugares/cotopaxi.jpg' };

/* ---------- Agregados al calendario (solo en este teléfono) ---------- */
const agregados = new Set((() => { try { return JSON.parse(localStorage.getItem('agregados') || '[]'); } catch { return []; } })());
function marcarAgregado(id) {
  agregados.add(id);
  try { localStorage.setItem('agregados', JSON.stringify([...agregados])); } catch {}
}

/* ---------- Splash ---------- */
function splash() {
  const s = $('#splash');
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visto = false;
  try { visto = sessionStorage.getItem('splash:' + location.pathname) === '1'; } catch {}
  if (visto) { s.remove(); return; }
  document.body.classList.add('con-splash');
  $('#splash-toro').innerHTML = toro;
  $('.splash-chispas').innerHTML = Array.from({ length: 14 }, (_, i) => `<i style="left:${6 + i * 6.5}%;--t:${5 + (i * 7) % 5}s;--r:${(1.5 + (i * 1.3) % 6).toFixed(1)}s;--x:${(i % 2 ? 1 : -1) * (10 + i * 3)}px"></i>`).join('');
  s.classList.add('anima');
  const t1 = setTimeout(() => s.classList.add('textos'), reducido ? 0 : 1200);
  // La portada pasa sola al inicio: se desvanece mientras el inicio sube.
  const cerrar = () => {
    clearTimeout(t1); clearTimeout(t2);
    s.classList.add('textos', 'fuera');
    document.body.classList.add('dentro');
    try { sessionStorage.setItem('splash:' + location.pathname, '1'); } catch {}
    setTimeout(() => { s.remove(); document.body.classList.remove('con-splash', 'dentro'); }, 2000);
  };
  const t2 = setTimeout(cerrar, reducido ? 1200 : 4600);
  s.addEventListener('click', cerrar, { once: true });
}

/* ---------- Navegación ---------- */
const VISTAS = ['inicio', 'programa', 'lugares', 'gratitud'];
const TITULOS = { inicio: 'Río Blanco Alto · 2026', programa: 'Actividades', lugares: 'Mapa del barrio', gratitud: 'Gracias' };
let vistaActual = 'inicio';
function ir(vista) {
  $$('.tab').forEach((t) => (t.dataset.ir === vista ? t.setAttribute('aria-current', 'page') : t.removeAttribute('aria-current')));
  $('#titulo-barra').textContent = TITULOS[vista];
  document.body.classList.toggle('en-inicio', vista === 'inicio');
  $('#atras').hidden = vista === 'inicio';
  $('#abrir-busqueda').hidden = vista !== 'programa';
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
let bajando = false;
function fabVisible() {
  const enInicio = !$('#vista-inicio').hidden;
  const enMapa = !$('#vista-lugares').hidden; // en el mapa la acción principal es Llegar al barrio
  const enGracias = !$('#vista-gratitud').hidden; // en Gracias la acción es enviar un agradecimiento
  $('#fab').classList.toggle('oculto', (enInicio && ctaVisible) || enMapa || enGracias || bajando);
}
// Al bajar se oculta para no tapar contenido; al subir vuelve a aparecer.
function observarScroll() {
  let ultimo = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (Math.abs(y - ultimo) < 8) return;
    bajando = y > ultimo && y > 40;
    ultimo = y;
    fabVisible();
  }, { passive: true });
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
    // El título dice la verdad del momento: si no hay nada en curso, anuncia lo que sigue.
    const t = e.fase === 'antes' ? `Empieza en ${diasFaltan()}` : e.ahora.length ? 'Qué está pasando' : 'Lo que sigue';
    html += `<h2 class="bloque-t">${t}</h2><div class="estado">${e.ahora.map((a) => tarjetaEstado(a, true)).join('')}${e.proximo ? tarjetaEstado(e.proximo, false) : ''}</div>`;
  }
  $('#estado').innerHTML = html;
}

function diasFaltan() {
  const d = Math.ceil((inicioUTC(D.actividades[0]).getTime() - ahora().getTime()) / 864e5);
  return d <= 1 ? 'pocas horas' : `${d} días`;
}

function pintarCarrusel() {
  const t = ahora().getTime();
  const proximas = D.actividades.filter((a) => a.destacado && (a.foto || (a.lugar !== 'barrio' && FOTOS[a.lugar])) && inicioUTC(a).getTime() > t - 36e5).slice(0, 10);
  $('.esperado').hidden = !proximas.length;
  $('#carrusel').innerHTML = proximas.map((a) => `<button class="tarjeta-foto tap" data-act="${a.id}">
      <img src="${a.foto || FOTOS[a.lugar]}" alt="" loading="lazy">
      <span class="tf-txt"><span class="tf-cuando">${esc(cuando(a))}</span><span class="tf-tit">${esc(a.titulo)}</span></span>
    </button>`).join('');
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

function filaAct(a, enCurso, pasada) {
  return `<li class="fila${enCurso ? ' en-curso' : ''}${pasada ? ' pasada' : ''}">
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
    html += filaAct(a, enCurso.has(a.id), !enCurso.has(a.id) && inicioUTC(a) < ahora());
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

// En el detalle, los agradecimientos largos se abren con «Ver más» y se recogen con «Ver menos».
const GRACIAS_VISIBLES = 4;
function listaGracias(nombres) {
  const unir = (xs) => xs.map(esc).join(' · ');
  if (nombres.length <= GRACIAS_VISIBLES) return unir(nombres);
  const resto = nombres.length - GRACIAS_VISIBLES;
  return `${unir(nombres.slice(0, GRACIAS_VISIBLES))}<span class="gracias-resto" hidden> · ${unir(nombres.slice(GRACIAS_VISIBLES))}</span>
    <button class="ver-mas" data-ver-mas="${resto}" aria-expanded="false">Ver más (${resto})</button>`;
}

// Plantilla única para todas las actividades (mismo orden y mismas secciones):
// cabecera → título → descripción → cuándo → dónde → a cargo de → gracias a
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
  const solemne = a.tipo === 'religioso';
  const titulo = `<div class="cab-txt"><h2 id="hoja-titulo">${esc(a.titulo)}</h2></div>`;
  const cabecera = src
    ? `<div class="hoja-cab afiche"><img class="hoja-foto" src="${src}" alt="">${titulo}${info}</div>`
    : `<div class="hoja-cab afiche portada ${solemne ? 'solemne' : 'fiesta'} k-${a.tipo}"><span class="ico-fondo">${iconosAct[a.icono] || ''}</span>${titulo}</div>`;
  const fila = (icono, etiqueta, valor, extra = '') => `<li>${icono}<span><span class="etq-dato">${etiqueta}</span>${valor}</span>${extra}</li>`;
  const donde = a.lugar === 'posada'
    ? fila(iconos.mapa, 'Dónde', `Posada de ${esc(a.anfitrion)}<span class="sub">Casa particular</span>`)
    : fila(iconos.mapa, 'Dónde', esc(l.nombre), l.mapa ? `<a class="ext" href="${l.mapa}" target="_blank" rel="noopener">Cómo llegar${iconos.externo}</a>` : '');
  abrirHoja(`${cabecera}
    ${a.descripcion ? `<p class="det">${esc(a.descripcion)}</p>` : ''}
    <ul class="datos">
      ${fila(iconos.reloj, 'Cuándo', `${fechaLarga(a.fecha)} · ${a.hora}`)}
      ${donde}
      ${a.aCargo ? fila(iconosAct.personas, 'A cargo de', esc(a.aCargo)) : ''}
      ${a.gentileza.length ? fila(iconos.personas, 'Gracias a', listaGracias(a.gentileza)) : ''}
    </ul>
    <div class="pie-hoja">
      <div class="pie-acciones">
        <div class="grupo-cal tap">
          <button class="btn btn-noche" data-agregar="${a.id}">${ok ? iconos.calOk : iconos.calMas}${ok ? 'Agregado a su calendario' : TEXTO_CAL.boton}</button>
          <button class="btn btn-noche btn-caret" data-opciones="${a.id}" aria-label="Elegir otro calendario">${iconos.abajo}</button>
        </div>
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
      <a class="opcion tap-suave" href="ics/${a.id}.ics" data-marcar="${a.id}">${iconos.calendario}<span>iPhone, Samsung u Outlook<span class="sub">Solo esta actividad</span></span></a>
      <a class="opcion tap-suave" href="${googleCalendarUrl(a, D.lugares, URL_SITIO)}" target="_blank" rel="noopener" data-marcar="${a.id}">${iconos.google}<span>Google Calendar<span class="sub">Solo esta actividad</span></span></a>
      <a class="opcion tap-suave" href="ics/destacados.ics">${iconos.descargar}<span>Solo las actividades principales<span class="sub">${ndest} actividades</span></span></a>
      <a class="opcion tap-suave" href="ics/todo.ics">${iconos.descargar}<span>Todas las actividades<span class="sub">${D.actividades.length} actividades</span></span></a>
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

// Cada punto del mapa (lugar o servicio) con los datos que muestra su tarjeta.
function puntos() {
  const lista = D.servicios.map((x) => ({ id: x.id, nombre: x.nombre, detalle: x.detalle, mapa: x.mapa, ico: `<span class="ic s-${x.tipo}">${iconos[SRV_ICO[x.tipo]]}</span>`, grupo: 'servicios' }));
  const usados = new Set(D.actividades.map((a) => a.lugar));
  const vistos = new Set();
  for (const [k, l] of Object.entries(D.lugares)) {
    if (l.lat == null || !usados.has(k) || vistos.has(`${l.lat},${l.lng}`)) continue;
    vistos.add(`${l.lat},${l.lng}`);
    lista.push({ id: k, nombre: k === 'plaza' ? 'Plaza central y plaza de toros' : l.nombre, detalle: '', mapa: l.mapa, ico: `<span class="ic s-lugar">${iconosAct[l.icono] || iconos.mapa}</span>`, grupo: 'lugares' });
  }
  return lista;
}

function pintarLugares() {
  const ll = D.llegada;
  $('#llegar').href = `https://www.google.com/maps/dir/?api=1&destination=${ll.lat}%2C${ll.lng}`;
  const fila = (p) => `<li><button class="srv tap-suave" data-ver="${p.id}" aria-pressed="false">
      ${p.ico}
      <span class="cuerpo"><span class="tit">${esc(p.nombre)}</span>${p.detalle ? `<span class="met">${esc(p.detalle)}</span>` : ''}</span>
      <span class="ubicar">${iconos.ubicar}</span>
    </button></li>`;
  const ps = puntos();
  $('#lista-servicios').innerHTML = ps.filter((p) => p.grupo === 'servicios').map(fila).join('');
  $('#lista-lugares').innerHTML = ps.filter((p) => p.grupo === 'lugares').map(fila).join('');
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
    const icon = L.divIcon({ className: '', html: `<span class="pin"></span><span class="pin-etq${l.etiqueta === 'arriba' ? ' arriba' : ''}">${esc(l.corto || l.nombre)}</span>`, iconSize: [14, 14], iconAnchor: [7, 7] });
    const mk = L.marker([l.lat, l.lng], { icon, title: l.nombre }).addTo(m).on('click', () => seleccionar(k));
    vistos[clave] = mk; marcadores[k] = mk; grupo.push([l.lat, l.lng]);
  }
  // Servicios (agrupados si comparten punto)
  const porPunto = {};
  for (const x of D.servicios) (porPunto[`${x.lat},${x.lng}`] = porPunto[`${x.lat},${x.lng}`] || []).push(x);
  for (const xs of Object.values(porPunto)) {
    const x = xs[0];
    const icon = L.divIcon({ className: '', html: `<span class="pin-grupo">${xs.map((y) => pinSrv(y.tipo)).join('')}</span>`, iconSize: [28 * xs.length, 26], iconAnchor: x.ancla || [-6, 30] });
    const mk = L.marker([x.lat, x.lng], { icon, title: xs.map((y) => y.nombre).join(' y ') }).addTo(m).on('click', () => seleccionar(x.id));
    for (const y of xs) marcadores[y.id] = mk;
    grupo.push([x.lat, x.lng]);
  }
  m.fitBounds(grupo, { paddingTopLeft: [30, 30], paddingBottomRight: [30, 70], maxZoom: 18 });
  setTimeout(() => m.invalidateSize(), 50);
}

// Una sola acción por fila: ubicar en el mapa y mostrar la tarjeta del lugar.
// Salir a Google Maps solo ocurre desde el botón con ↗ de la tarjeta.
function seleccionar(id) {
  const p = puntos().find((x) => x.id === id);
  if (!p) return;
  $$('[data-ver]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.ver === id)));
  const t = $('#tarjeta-lugar');
  t.innerHTML = `${p.ico}<span class="cuerpo"><span class="tit">${esc(p.nombre)}</span>${p.detalle ? `<span class="met">${esc(p.detalle)}</span>` : ''}</span>
    <button class="cerrar-t" data-deseleccionar aria-label="Cerrar">${iconos.cerrar}</button>
    <a class="btn btn-noche tap ext" href="${p.mapa}" target="_blank" rel="noopener">Abrir en Google Maps${iconos.externo}</a>`;
  t.hidden = false; $('#llegar').hidden = true;
  const mk = marcadores[id];
  if (mapaL && mk) mapaL.flyTo(mk.getLatLng(), 18, { duration: .6 });
}
function deseleccionar() {
  $$('[data-ver]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
  $('#tarjeta-lugar').hidden = true; $('#llegar').hidden = false;
}

/* ---------- Buscar en el programa ---------- */
function pintarResultados(q = '') {
  const r = $('#resultados');
  if (!normalizar(q)) { r.innerHTML = `<li class="vacio">Escriba el nombre de una actividad, un lugar o una persona.</li>`; return; }
  const acts = buscarActividades(D.actividades, D.lugares, q);
  if (!acts.length) { r.innerHTML = `<li class="vacio">No encontramos actividades con ese nombre. Pruebe con otra palabra.</li>`; return; }
  r.innerHTML = acts.map((a) => `<li class="fila${inicioUTC(a) < ahora() ? ' pasada' : ''}">
    <button class="fila-main tap-suave" data-resultado="${a.id}">
      <span class="cuerpo">
        <span class="res-cuando">${fechaLarga(a.fecha)} · ${a.hora}</span>
        <span class="tit">${esc(a.titulo)}</span>
        <span class="met">${icPeq(a)}<span>${esc(lugarTexto(a))}</span></span>
      </span>
      <span class="chev">${iconos.chev}</span>
    </button></li>`).join('');
}
function abrirBusqueda() {
  $('#busqueda').hidden = false; document.body.style.overflow = 'hidden';
  $('#buscar-act').value = ''; pintarResultados(); $('#buscar-act').focus();
}
function cerrarBusqueda() {
  if ($('#busqueda').hidden) return;
  $('#busqueda').hidden = true; document.body.style.overflow = '';
}

/* ---------- Gracias ---------- */
// Se agradece a todos los que nombra el programa: priostes, posadas, quienes están a cargo,
// quienes participan y cada gentileza. Los nombres se muestran tal como están en el programa.
function pintarGratitud(q = '') {
  const nq = normalizar(q);
  const coincide = (n) => !nq || normalizar(n).includes(nq);
  const marca = (n) => {
    if (!nq) return esc(n);
    const i = normalizar(n).indexOf(nq);
    return i < 0 ? esc(n) : esc(n.slice(0, i)) + '<mark>' + esc(n.slice(i, i + nq.length)) + '</mark>' + esc(n.slice(i + nq.length));
  };
  const fila = (r) => `<li><button class="nombre tap-suave" data-gracias="${esc(r.nombre)}" data-ctx="${esc(r.motivo)}" data-msj="${esc(r.mensaje || '')}"><span class="nom-txt"><span class="nom">${marca(r.nombre)}</span>${r.rol ? `<span class="rol">${esc(r.rol)}</span>` : ''}</span>${iconos.chev}</button></li>`;
  let html = '';
  const pri = D.fiesta.priostes.filter(coincide);
  if (pri.length && (nq || !ui.gdia)) html += `<article class="grupo grupo-priostes"><h3>Priostes 2026</h3><p class="grupo-sub">Con su esfuerzo y generosidad hacen posible la fiesta de Nuestra Patrona.</p><ul class="nombres">${pri.map((n) => fila({ nombre: n, rol: '', motivo: 'como Prioste de las fiestas 2026' })).join('')}</ul></article>`;
  if (!nq) {
    const chip = (f, t) => `<button class="chip" data-gdia="${f}" aria-pressed="${ui.gdia === f}">${t}</button>`;
    html += `<p class="pista">Toque un nombre para enviarle su agradecimiento.</p><div class="dias-g" role="group" aria-label="Ver por día">${chip('', 'Todos')}${dias().map((f) => { const d = new Date(f + 'T12:00:00Z'); return chip(f, `${DIAS_SEM[d.getUTCDay()].slice(0, 3)} ${d.getUTCDate()}`); }).join('')}</div>`;
  }
  let hay = pri.length > 0;
  for (const f of dias()) {
    if (!nq && ui.gdia && ui.gdia !== f) continue;
    const grupos = D.actividades.filter((a) => a.fecha === f).map((a) => ({ a, rs: reconocimientos(a).filter((r) => coincide(r.nombre)) })).filter((g) => g.rs.length);
    if (!grupos.length) continue;
    hay = true;
    html += `<h3 class="dia-g">${fechaLarga(f)}</h3>` + grupos.map(({ a, rs }) => `<article class="grupo"><div class="grupo-cab"><span class="ev">${a.hora}</span><h4>${esc(a.titulo)}</h4></div><ul class="nombres">${rs.map(fila).join('')}</ul></article>`).join('');
  }
  $('#gratitud').innerHTML = hay ? html : `<p class="vacio">No encontramos ese nombre. Pruebe solo con el apellido.</p>`;
}

function tarjetaGracias(nombre, motivo, mensaje = '') {
  abrirHoja(`<div class="tarj-gracias">
      <p class="tg-k">Fiestas de Río Blanco Alto 2026</p>
      <p class="tg-t">Gracias</p>
      <h2 id="hoja-titulo" class="tg-n">${esc(nombre)}</h2>
      <p class="tg-c">${esc(motivo)}</p>
      ${mensaje ? `<p class="tg-m">${esc(mensaje)}</p>` : ''}
    </div>
    <div class="pie-hoja"><div class="pie-acciones">
      <button class="btn btn-noche tap tg-btn" data-enviar-gracias="${esc(nombre)}" data-ctx="${esc(motivo)}">${iconos.compartir}Enviar agradecimiento</button>
    </div></div>`, '', 'gracias');
}

/* ---------- Compartir ---------- */
async function compartir({ title, text, url }) {
  if (navigator.share) {
    try { await navigator.share({ title, text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank', 'noopener');
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
    if (d.resultado) { const a = actividad(d.resultado); cerrarBusqueda(); ui.dia = a.fecha; pintarDias(); pintarLista(); return detalle(a.id); }
    if (b.id === 'abrir-busqueda') return abrirBusqueda();
    if (b.id === 'cerrar-busqueda') return cerrarBusqueda();
    if ('gdia' in d) { ui.gdia = d.gdia; pintarGratitud(); return; }
    if (d.act) return detalle(d.act);
    if (d.opciones) return opciones(d.opciones);
    if (d.ver) return seleccionar(d.ver);
    if ('deseleccionar' in d) return deseleccionar();
    if (d.verMas) { const r = b.parentElement.querySelector('.gracias-resto'); r.hidden = !r.hidden; b.setAttribute('aria-expanded', String(!r.hidden)); b.textContent = r.hidden ? `Ver más (${d.verMas})` : 'Ver menos'; return; }
    if ('info' in d) { const c = b.parentElement.querySelector('.credito'); c.hidden = !c.hidden; return; }
    if (d.marcar) { marcarAgregado(d.marcar); return; }
    if (d.compartirAct) {
      const a = actividad(d.compartirAct);
      return compartir({ title: a.titulo, text: `${a.titulo} · ${fechaLarga(a.fecha)}, ${a.hora}. Fiestas de la Santísima Virgen de El Quinche, Río Blanco Alto.`, url: `${URL_SITIO}#a/${a.id}` });
    }
    if (d.gracias) return tarjetaGracias(d.gracias, d.ctx, d.msj);
    if (d.enviarGracias) {
      return compartir({ title: 'Gracias', text: `Gracias, ${d.enviarGracias}, ${d.ctx}. Fiestas en honor a la Santísima Virgen de El Quinche, Río Blanco Alto 2026.`, url: URL_SITIO });
    }
    if (b.id === 'fab') {
      return compartir({ title: 'Fiestas Río Blanco Alto 2026', text: 'Les invitamos a las fiestas en honor a la Santísima Virgen de El Quinche en Río Blanco Alto, del 13 al 22 de noviembre. Aquí están todas las actividades y horarios:', url: URL_SITIO });
    }
    if (b.id === 'hoja-cerrar') cerrarHoja();
  });
  $('#velo').addEventListener('click', cerrarHoja);
  document.addEventListener('keydown', (e) => { if (e.key !== 'Escape') return; if (!$('#hoja').hidden) cerrarHoja(); else cerrarBusqueda(); });
  $('#buscar-act').addEventListener('input', (e) => pintarResultados(e.target.value));
  $('#buscar').addEventListener('input', (e) => pintarGratitud(e.target.value));
}

/* ---------- Arranque ---------- */
async function iniciar() {
  splash();
  document.body.classList.add('en-inicio');
  $('#hoja-cerrar').innerHTML = iconos.cerrar;
  $$('.buscador-icono').forEach((e) => { e.innerHTML = iconos.buscar; });
  $$('[data-ico]').forEach((e) => { e.outerHTML = iconos[e.dataset.ico]; });
  $$('[data-ico-act]').forEach((e) => { e.innerHTML = iconosAct[e.dataset.icoAct]; });
  $('#hero-virgen').innerHTML = virgen;

  // Los datos se revalidan en cada visita, para que un cambio de horario se vea de inmediato.
  D = await (await fetch('data/programa.json', { cache: 'no-cache' })).json();
  const hoy = diaEcuador(ahora());
  const ds = dias();
  ui.dia = ds.includes(hoy) ? hoy : (hoy < ds[0] ? ds[0] : ds[ds.length - 1]);

  pintarEstado(); pintarCarrusel(); pintarPriostes(); pintarDias(); pintarFiltros(); pintarLista(); pintarLugares(); pintarGratitud();
  eventos();
  observarCta(); observarScroll(); fabVisible();
  setInterval(() => { pintarEstado(); if (!$('#vista-programa').hidden) pintarLista(); }, 60000);

  const m = location.hash.match(/^#a\/(.+)$/);
  if (m && actividad(m[1])) {
    ui.dia = actividad(m[1]).fecha;
    pintarDias(); pintarLista(); ir('programa'); detalle(m[1]);
  }
}

iniciar();
