import { estado, inicioUTC, diaEcuador, horaEcuador, googleCalendarUrl, normalizar, buscarActividades, colaboradores } from './nucleo.js?v=202611141546';
import { toro, virgen, iconos, iconosAct } from './ilustraciones.js?v=202611141546';

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
  ios: { boton: 'Agregar recordatorio' },
  android: { boton: 'Agregar recordatorio' },
  otro: { boton: 'Agregar recordatorio' },
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
  // La Virgen es la protagonista de la portada: se dibuja trazo a trazo, con destellos.
  $('#splash-virgen').innerHTML = virgen + '<i class="brillo b1"></i><i class="brillo b2"></i><i class="brillo b3"></i><i class="brillo b4"></i>';
  $$('#splash-virgen .trazo path').forEach((p, i) => { p.setAttribute('pathLength', '1'); p.style.setProperty('--r', `${0.3 + i * 0.09}s`); });
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
  const t2 = setTimeout(cerrar, reducido ? 1200 : 4200);
  s.addEventListener('click', cerrar, { once: true });
}

/* ---------- Navegación ---------- */
const VISTAS = ['inicio', 'programa', 'lugares', 'gratitud'];
const TITULOS = { inicio: 'Río Blanco Alto · 2026', programa: 'Actividades', lugares: 'Mapa del barrio', gratitud: 'Gracias' };
let vistaActual = 'inicio';
// Al entrar a Actividades se muestra el momento actual: el día de hoy y, dentro de él,
// la actividad en curso; si no hay ninguna, la línea de «Ahora».
function irAlMomento() {
  const hoy = diaEcuador(ahora());
  if (!dias().includes(hoy)) return;
  if (ui.dia !== hoy) { ui.dia = hoy; pintarDias(); pintarLista(); }
  const destino = $('#lista .fila.en-curso') || $('#ahora');
  if (destino) destino.scrollIntoView({ block: 'center' });
}

function ir(vista, { alMomento = true } = {}) {
  $$('.tab').forEach((t) => (t.dataset.ir === vista ? t.setAttribute('aria-current', 'page') : t.removeAttribute('aria-current')));
  document.body.classList.toggle('en-inicio', vista === 'inicio');
  if (vista === vistaActual) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  const antes = $(`#vista-${vistaActual}`);
  const despues = $(`#vista-${vista}`);
  vistaActual = vista;
  antes.classList.remove('entra'); antes.classList.add('sale');
  setTimeout(() => {
    antes.hidden = true; antes.classList.remove('sale');
    despues.hidden = false; despues.classList.remove('entra'); void despues.offsetWidth; despues.classList.add('entra');
    window.scrollTo(0, 0);
    if (vista === 'programa') { if (alMomento) irAlMomento(); $('.dia[aria-selected="true"]')?.scrollIntoView({ inline: 'center', block: 'nearest' }); }
    if (vista === 'lugares') mapa();
    fabVisible();
  }, 150);
}

// En el inicio, el botón flotante aparece cuando ya pasó el botón principal (para no taparlo).
let bajando = false;
function fabVisible() {
  const enMapa = !$('#vista-lugares').hidden; // en el mapa la acción principal es Llegar al barrio
  $('#fab').classList.toggle('oculto', enMapa || bajando);
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

let ultimoEstado = '';
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
  if (ultimoEstado !== html) { ultimoEstado = html; $('#estado').innerHTML = html; } // sin repintar si nada cambió
}

function diasFaltan() {
  const d = Math.ceil((inicioUTC(D.actividades[0]).getTime() - ahora().getTime()) / 864e5);
  return d <= 1 ? 'pocas horas' : `${d} días`;
}

function pintarCarrusel() {
  const t = ahora().getTime();
  const proximas = D.actividades.filter((a) => a.destacado && (a.foto || (a.lugar !== 'barrio' && FOTOS[a.lugar])) && inicioUTC(a).getTime() > t - 36e5).slice(0, 10);
  $('.esperado').hidden = !proximas.length;
  // Lista corta con foto pequeña: la información primero, la imagen acompaña.
  const html = proximas.slice(0, 4).map((a) => `<button class="item item-foto tap-suave" data-act="${a.id}">
      <img src="${a.foto || FOTOS[a.lugar]}" alt="" loading="lazy">
      <span class="cuerpo"><span class="etq">${esc(cuando(a))}</span><span class="tit">${esc(a.titulo)}</span><span class="met">${esc(lugarTexto(a))}</span></span>
      <span class="chev">${iconos.chev}</span>
    </button>`).join('');
  if ($('#carrusel').innerHTML !== html) $('#carrusel').innerHTML = html;
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

// animar=false es el refresco de cada minuto: actualiza sin volver a animar la lista.
function pintarLista(animar = true) {
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
  if (!animar) { if (l.dataset.html !== html) { l.dataset.html = html; l.classList.remove('escalonado'); l.innerHTML = html; } return; }
  l.dataset.html = html;
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
  setTimeout(() => { h.hidden = true; v.hidden = true; h.classList.remove('sale'); v.classList.remove('sale'); h.style.transform = ''; h.style.transition = ''; v.style.opacity = ''; $('#fab').hidden = false; }, 230);
  document.body.style.overflow = '';
  if (location.hash.startsWith('#a/')) history.replaceState(null, '', location.pathname + location.search);
}

// En el detalle, los agradecimientos largos se abren con «Ver más» y se recogen con «Ver menos».
const GRACIAS_VISIBLES = 4;
function listaGracias(nombres) {
  const lineas = (xs) => xs.map((n) => `<span class="g-nom">${esc(n)}</span>`).join('');
  if (nombres.length <= GRACIAS_VISIBLES) return lineas(nombres);
  return `${lineas(nombres.slice(0, GRACIAS_VISIBLES))}<span class="gracias-resto" hidden>${lineas(nombres.slice(GRACIAS_VISIBLES))}</span>
    <button class="ver-mas" data-ver-mas="${nombres.length}" aria-expanded="false">Ver los ${nombres.length} nombres${iconos.abajo}</button>`;
}

// Cerrar la hoja con el dedo: un jalón largo o rápido hacia abajo la cierra;
// uno corto y suave la deja donde estaba. Solo actúa cuando la hoja está arriba del todo,
// para no estorbar la lectura cuando el contenido se desplaza.
const CIERRE_DISTANCIA = 140; // px recorridos
const CIERRE_VELOCIDAD = 0.55; // px por milisegundo
const CIERRE_MINIMO = 40; // px mínimos para que un jalón rápido cuente
function arrastreHoja() {
  const h = $('#hoja'); const v = $('#velo');
  let y0 = null; let dy = 0; let activo = false; let muestras = [];
  h.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1 || h.scrollTop > 0 || h.classList.contains('sale')) { y0 = null; return; }
    y0 = e.touches[0].clientY; dy = 0; activo = false; muestras = [[e.timeStamp, y0]];
  }, { passive: true });
  h.addEventListener('touchmove', (e) => {
    if (y0 === null) return;
    const y = e.touches[0].clientY; dy = y - y0;
    if (!activo) {
      if (dy < -8) { y0 = null; return; } // va hacia arriba: es lectura, no cierre
      if (dy <= 8 || h.scrollTop > 0) return;
      activo = true; h.style.transition = 'none';
    }
    e.preventDefault();
    muestras.push([e.timeStamp, y]); if (muestras.length > 5) muestras.shift();
    h.style.transform = `translateY(${Math.max(0, dy)}px)`;
    v.style.opacity = String(Math.max(0.25, 1 - dy / 480));
  }, { passive: false });
  const soltar = () => {
    if (y0 === null || !activo) { y0 = null; return; }
    const [t1, y1] = muestras[0]; const [t2, y2] = muestras[muestras.length - 1];
    const velocidad = (y2 - y1) / Math.max(1, t2 - t1);
    y0 = null; activo = false;
    if (dy > CIERRE_DISTANCIA || (velocidad > CIERRE_VELOCIDAD && dy > CIERRE_MINIMO)) { cerrarHoja(); return; }
    h.style.transition = 'transform .3s var(--ease-out)'; h.style.transform = ''; v.style.opacity = '';
    setTimeout(() => { h.style.transition = ''; }, 320);
  };
  h.addEventListener('touchend', soltar); h.addEventListener('touchcancel', soltar);
}

// Plantilla única para todas las actividades (mismo orden y mismas secciones):
// cabecera → título → descripción → cuándo → dónde → a cargo de → gracias a
function detalle(id) {
  const a = actividad(id);
  if (!a) return;
  history.replaceState(null, '', `${location.search}#a/${a.id}`);
  const l = lugar(a);
  const ok = agregados.has(a.id);
  const src = a.foto; // sin foto propia no se muestra una genérica: la información va primero
  const info = a.credito
    ? `<button class="info-foto" data-info aria-label="Créditos de la foto">${iconos.info}</button>
       <a class="credito" href="${a.credito.url}" target="_blank" rel="noopener" hidden>Foto: ${esc(a.credito.autor)} · ${a.credito.licencia}</a>` : '';
  // En las corridas, el toro de línea dorada respira junto al título.
  const conToro = a.id.includes('corrida');
  const titulo = `<div class="cab-txt${conToro ? ' con-toro' : ''}"><h2 id="hoja-titulo">${esc(a.titulo)}</h2></div>${conToro ? `<div class="toro-detalle" aria-hidden="true">${toro}</div>` : ''}`;
  const cabecera = src
    ? `<div class="hoja-cab afiche"><img class="hoja-foto" src="${src}" alt="">${titulo}${info}</div>`
    : `<h2 id="hoja-titulo" class="titulo-simple">${esc(a.titulo)}</h2>`;
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
          <button class="btn btn-noche" data-agregar="${a.id}">${ok ? iconos.calOk : iconos.calMas}${ok ? 'Recordatorio agregado' : TEXTO_CAL.boton}</button>
          <button class="btn btn-noche btn-caret" data-opciones="${a.id}" aria-label="Elegir otro calendario">${iconos.abajo}</button>
        </div>
        <button class="btn btn-borde tap" data-compartir-act="${a.id}" aria-label="Compartir esta actividad">${iconos.compartir}Compartir</button>
      </div>
    </div>`, a.id, 'detalle', Boolean(src));
}

function opciones(id) {
  const a = actividad(id);
  abrirHoja(`
    <button class="enlace" data-act="${a.id}">${iconos.atras}Volver</button>
    <h2 id="hoja-titulo">Elija su calendario</h2>
    <div class="opciones">
      <a class="opcion tap-suave" href="ics/${a.id}.ics" data-marcar="${a.id}">${iconos.calendario}<span>Calendario del teléfono<span class="sub">iPhone, Samsung u Outlook</span></span></a>
      <a class="opcion tap-suave" href="${googleCalendarUrl(a, D.lugares, URL_SITIO)}" target="_blank" rel="noopener" data-marcar="${a.id}">${iconos.google}<span>Google Calendar</span></a>
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
const SRV_ICO = { parqueo: 'parqueo', banos: 'banos', comida: 'comida', juegos: 'juegos' };
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
  // Contorno de los lugares grandes, con el mismo gris con que el mapa dibuja la iglesia.
  for (const l of Object.values(D.lugares)) if (l.forma) L.polygon(l.forma, { color: '#8F8F8F', weight: 1, fillColor: '#B5B5B5', fillOpacity: .75, interactive: false }).addTo(m);
  // Lugares de la fiesta (un punto por coordenada)
  const vistos = {};
  for (const [k, l] of Object.entries(D.lugares)) {
    if (l.lat == null) continue;
    const clave = `${l.lat},${l.lng}`;
    if (vistos[clave]) { marcadores[k] = vistos[clave]; continue; }
    const icon = L.divIcon({ className: '', html: `<span class="pin"></span><span class="pin-etq${l.etiqueta ? ' ' + l.etiqueta : ''}">${esc(l.corto || l.nombre)}</span>`, iconSize: [14, 14], iconAnchor: [7, 7] });
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
  // El mapa no sale del barrio: no se puede alejar ni arrastrar fuera de la zona de la fiesta.
  m.setMinZoom(m.getZoom());
  m.setMaxBounds(m.getBounds().pad(0.25));
  m.options.maxBoundsViscosity = 1;
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
// Una sola lista de nombres, tal como están en el programa. Al tocar uno se despliega en qué colaboró.
function pintarGratitud(q = '') {
  const nq = normalizar(q);
  const marca = (n) => {
    if (!nq) return esc(n);
    const i = normalizar(n).indexOf(nq);
    return i < 0 ? esc(n) : esc(n.slice(0, i)) + '<mark>' + esc(n.slice(i, i + nq.length)) + '</mark>' + esc(n.slice(i + nq.length));
  };
  const lista = colaboradores(D.actividades).filter((c) => !nq || normalizar(c.nombre).includes(nq));
  $('#gratitud').innerHTML = lista.map((c) => `<li>
      <button class="nombre tap-suave" data-colab aria-expanded="false"><span class="nom">${marca(c.nombre)}</span>${iconos.abajo}</button>
      <ul class="aportes" hidden>${c.aportes.map((p) => `<li><span class="ap-act">${esc(p.titulo)}</span><span class="ap-rol">${esc(p.rol)} · ${fechaLarga(p.fecha)}</span>${p.mensaje ? `<span class="ap-msj">${esc(p.mensaje)}</span>` : ''}</li>`).join('')}</ul>
    </li>`).join('') || `<li class="vacio">No encontramos ese nombre. Pruebe solo con el apellido.</li>`;
}

/* ---------- Ver una foto en grande ---------- */
function abrirVisor(src) { const v = $('#visor'); $('img', v).src = src; v.hidden = false; }
function cerrarVisor() { $('#visor').hidden = true; }

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
    if ('colab' in d) { const u = b.nextElementSibling; u.hidden = !u.hidden; b.setAttribute('aria-expanded', String(!u.hidden)); return; }
    if (d.act) return detalle(d.act);
    if (d.opciones) return opciones(d.opciones);
    if (d.ver) return seleccionar(d.ver);
    if ('deseleccionar' in d) return deseleccionar();
    if (d.verMas) { const r = b.parentElement.querySelector('.gracias-resto'); r.hidden = !r.hidden; b.setAttribute('aria-expanded', String(!r.hidden)); b.innerHTML = (r.hidden ? `Ver los ${d.verMas} nombres` : 'Ver menos') + iconos.abajo; return; }
    if ('info' in d) { const c = b.parentElement.querySelector('.credito'); c.hidden = !c.hidden; return; }
    if (d.marcar) { marcarAgregado(d.marcar); return; }
    if (d.compartirAct) {
      const a = actividad(d.compartirAct);
      return compartir({ title: a.titulo, text: `${a.titulo} · ${fechaLarga(a.fecha)}, ${a.hora}. Fiestas de la Santísima Virgen de El Quinche, Río Blanco Alto.`, url: `${URL_SITIO}#a/${a.id}` });
    }
    if (b.id === 'fab') {
      return compartir({ title: 'Fiestas Río Blanco Alto 2026', text: 'Les invitamos a las fiestas en honor a la Santísima Virgen de El Quinche en Río Blanco Alto, del 13 al 22 de noviembre. Aquí están todas las actividades y horarios:', url: URL_SITIO });
    }
    if (b.id === 'hoja-cerrar') cerrarHoja();
  });
  $('#velo').addEventListener('click', cerrarHoja);
  document.addEventListener('keydown', (e) => { if (e.key !== 'Escape') return; if (!$('#visor').hidden) cerrarVisor(); else if (!$('#hoja').hidden) cerrarHoja(); else cerrarBusqueda(); });
  // Tocar una foto la muestra completa; tocar de nuevo la cierra.
  document.addEventListener('click', (ev) => {
    if (!$('#visor').hidden) { cerrarVisor(); return; }
    if (ev.target.closest('button, a')) return;
    const marco = ev.target.closest('.hoja-cab');
    const img = marco && $('img', marco);
    if (img) abrirVisor(img.currentSrc || img.src);
  });
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
  $('#hero-virgen').innerHTML = virgen + '<i class="brillo b1"></i><i class="brillo b2"></i><i class="brillo b3"></i>';

  // Los datos se revalidan en cada visita, para que un cambio de horario se vea de inmediato.
  D = await (await fetch('data/programa.json', { cache: 'no-cache' })).json();
  const hoy = diaEcuador(ahora());
  const ds = dias();
  ui.dia = ds.includes(hoy) ? hoy : (hoy < ds[0] ? ds[0] : ds[ds.length - 1]);

  pintarEstado(); pintarCarrusel(); pintarPriostes(); pintarDias(); pintarFiltros(); pintarLista(); pintarLugares(); pintarGratitud();
  eventos();
  observarScroll(); fabVisible(); arrastreHoja();
  setInterval(() => { pintarEstado(); pintarCarrusel(); if (!$('#vista-programa').hidden) pintarLista(false); }, 60000);

  const m = location.hash.match(/^#a\/(.+)$/);
  if (m && actividad(m[1])) {
    ui.dia = actividad(m[1]).fecha;
    pintarDias(); pintarLista(); ir('programa', { alMomento: false }); detalle(m[1]);
  }
}

iniciar();
