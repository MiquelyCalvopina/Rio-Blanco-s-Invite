# Diseño: invitación digital · Fiestas de la Santísima Virgen de El Quinche, Río Blanco Alto 2026

Estado: borrador para aprobación · Fecha: 2026-11-13

## 1. Intención y porqué

Los Priostes 2026 (familia Jácome entre ellos) organizan las fiestas en honor a la Santísima Virgen de El Quinche, Patrona del barrio Río Blanco Alto (Tanicuchí, Latacunga), del **viernes 13 al domingo 22 de noviembre de 2026**. El programa existe solo como tríptico impreso.

Queremos una invitación digital, que se comparte por WhatsApp, que permita recorrer el programa día por día, agregar cada actividad al calendario del teléfono con recordatorios y agradecer a quienes donan. Debe transmitir la identidad del barrio con un lenguaje visual moderno: **"Raíces fuertes, tradiciones vivas"**.

**North Star:** que más personas asistan a las actividades. Muchos viajan desde Latacunga o Quito (mínimo ~1 h 30).

Contexto e investigación: `docs/research/rio-blanco-alto.md`. Programa fuente: `docs/research/triptico/` (6 imágenes). Fotos de referencia: `docs/research/fotos/`.

## 2. Metas, no-metas, anti-metas

**Metas**
1. Ver de inmediato qué está pasando y qué sigue, según la hora real del Ecuador.
2. Recorrer las ~70 actividades por día sin perderse.
3. Agregar una actividad (o todo el programa) al calendario en iPhone y en Android, con recordatorios.
4. Llegar al lugar (Cómo llegar).
5. Compartir la invitación y cada actividad, sobre todo por WhatsApp.
6. Agradecer públicamente a priostes y donantes ("gentileza de").

**No-metas**
- Registro, inicio de sesión, RSVP o recolección de datos personales.
- Notificaciones push (en iPhone exigen instalar la web en la pantalla de inicio: demasiada fricción).
- Edición del programa desde la interfaz (los datos se editan en un archivo).
- Usar el sistema de marca de Plugthem (decisión de la usuaria: proyecto familiar con identidad propia).

**Anti-metas** (fracaso aunque funcione)
- Pantallas cargadas: cada elemento debe informar algo necesario, llevar a algún lugar o comunicar algo urgente. Si no, sale.
- Juzgar, ocultar o exaltar tradiciones sensibles (toros populares, gallos de pelea). Se muestran tal como están en el programa, con tono descriptivo.
- Parecerse al tríptico: no se reutiliza su diseño, su collage ni su imagen de la Virgen.
- Sonar extraño para la sierra ecuatoriana o usar anglicismos.

## 3. Restricciones

- Funciona en **Android y iPhone**, en navegadores móviles actuales (Chrome Android, Safari iOS), con señal rural débil.
- Sitio **estático** (HTML, CSS y JavaScript sin framework ni paso de build), publicado en **GitHub Pages** desde este repositorio.
- Zona horaria del evento: **America/Guayaquil (UTC−5, sin horario de verano)**. Toda lógica de "ahora" y todo calendario usa esa zona, sin importar la del teléfono.
- Idioma: español de la sierra ecuatoriana, trato de **usted** (ver §8).
- Accesibilidad: contraste WCAG 2.1 AA, objetivos táctiles ≥ 44 px, respeta `prefers-reduced-motion`.
- Peso: la primera carga (sin fuentes) ≤ 300 KB.

## 4. Enfoques considerados

| Enfoque | Ventaja | Costo | Decisión |
|---|---|---|---|
| **1. Web estática + GitHub Pages** | Rápida con mala señal; enlace público para WhatsApp; `.ics` generado en el teléfono; corregir un evento es editar un dato | GitHub Pages requiere repo público o plan pago | **Elegido por la usuaria** |
| 2. Framework (Astro/Next) | Más estructura | Sobra para una página; más tiempo | Descartado |
| 3. Artifact de claude.ai | Publicación inmediata | Nace privado; peor para difusión masiva | Descartado |

## 5. Experiencia (lo decidido)

### 5.1 Splash
- Pantalla completa **azul noche** con ilustraciones en **línea dorada** que se dibujan como trazo de marcador: un **torito** y la **iglesia** (tres torres con cruces; la central más alta).
- Texto: "Fiestas en honor a la Santísima Virgen de El Quinche", **Río Blanco Alto**, "13 al 22 de noviembre de 2026".
- Al terminar la animación se abre el Inicio.
- *Llamada del diseñador:* dura ~2,5 s; un toque la salta; se muestra solo en la primera apertura de la sesión del navegador; con `prefers-reduced-motion` aparece ya dibujada y avanza a ~1 s.

### 5.2 Inicio
- **Ilustración de línea dorada de la Virgen** (manto triangular, corona, Niño con orbe, cetro, halo sutil), protagonista. No se usa ninguna foto de la Virgen.
- Nombre de la fiesta, Río Blanco Alto y fechas.
- **Tarjeta "Qué está pasando"**, calculada con la hora real del Ecuador:
  - Durante una actividad: "Ahora: …" + "Lo próximo: … · hora".
  - Entre actividades: "Lo próximo: … · hora · lugar".
  - Antes del 13: cuenta regresiva al inicio.
  - Después del 22: agradecimiento y cierre.
  - Tocar la tarjeta abre el detalle de esa actividad.
- **Compartir siempre visible** arriba a la derecha, en todas las pantallas.
- Un botón principal: **"Ver el programa"**.

### 5.3 Programa
- **Tira de días fija** arriba (13 al 22). Abre en el día de hoy; antes del 13 abre el 13; después del 22, el 22. Los días con actividades principales llevan un marcador sutil.
- Lista vertical por día con la hora grande a la izquierda.
- Actividades principales como tarjetas más grandes. Marcadas con `destacado: true` en los datos (procesión/peregrinación, misas, coronación, vísperas, corridas, desfiles de colchas, Noche Cultural, entrada de frutas y confites, baile de cierre).
- Línea de **"Ahora"** dentro de la lista del día en curso.
- Actividades nocturnas (desde las 18:00) con tratamiento azul noche; diurnas en fondo claro.
- **Filtros** por tipo, máximo 5: Todo · Religioso · Cultural · Popular · Deportivo. Cada actividad tiene exactamente un tipo en los datos.
- Sin vista de mes ni cuadrícula.

### 5.4 Detalle de actividad (hoja inferior)
- Tipo, título, día y hora, lugar, quién la celebra o anima (si el programa lo dice), **"Gentileza de …"**.
- Fila de 3 acciones: **Calendario · Cómo llegar · Compartir**.
- Si el término tiene una explicación de fuente verificada o de la familia (p. ej. Yumbada), una línea "Qué es". Si no hay fuente, no se escribe nada.

### 5.5 Agregar al calendario
- Hoja con dos opciones grandes, **primero la del sistema del teléfono**: **iPhone · Calendario** (archivo `.ics`) y **Google Calendar** (enlace). "Otro calendario (.ics)" como enlace secundario.
- **Recordatorios (decididos):** 1 día antes a la misma hora y 2 horas antes (cubre ~1 h 30 de viaje con margen). Van como `VALARM` (`-P1D` y `-PT2H`) en el `.ics`.
- Google Calendar no permite fijar recordatorios por enlace, y hay reportes de que ignora alarmas importadas. La hoja lo dice en una línea: "Al guardar en Google, active la alerta."
- **Atajo masivo:** "Agregar todo el programa" y "Solo los días grandes" en un solo `.ics`. Funciona en iPhone. En Android depende de la app de calendario; se prueba y, si no es confiable, se indica.
- Si el programa no da hora de fin, se usa 1 hora de duración.

### 5.6 Cómo llegar
- Abre Google Maps (app o web) con el destino del lugar de la actividad.

### 5.7 Gratitud
- Sección propia: **Priostes 2026** primero, luego donantes agrupados por actividad, con buscador por nombre o familia.
- Texto de cabecera inspirado en el agradecimiento del programa: "Gracias a quienes, con su generosidad, hacen posible la fiesta de Nuestra Patrona."
- Cada nombre puede **compartir su agradecimiento** (texto + enlace por WhatsApp/Web Share). *Llamada del diseñador:* es texto con enlace, no imagen generada; la vista previa la da la imagen OG del sitio.
- Los nombres se transcriben tal como aparecen en el programa impreso, que ya es público.

### 5.8 Navegación
- Una sola página con tres vistas: **Inicio · Programa · Gratitud**, en una barra inferior de 3 pestañas. Compartir arriba a la derecha.

### 5.9 Temas sensibles
- Todos los eventos del programa aparecen. Toros populares y gallos de pelea van con su nombre del programa, tipo "Popular", sin fotos ni adjetivos añadidos.
- Ninguna foto de animales en la interfaz.

## 6. Sistema visual

- **Colores** (aprobados):

  | Token | Hex | Uso |
  |---|---|---|
  | `--noche` | `#0B1636` | Fondo de splash, noche, fe |
  | `--noche-2` | `#16285C` | Degradados |
  | `--oro` | `#D4A64A` | Ilustraciones de línea, CTA principal |
  | `--oro-claro` | `#F1D68C` | Texto sobre noche |
  | `--nieve` | `#F7F4EC` | Fondo claro |
  | `--crema` | `#EFE6D2` | Superficies |
  | `--alpen` | `#E9B9CB` | Acento mínimo (marcador de días grandes) |
  | `--pino` | `#2F5D46` | Tipo Cultural / raya de poncho |
  | `--tierra` | `#6B4A2E` | Tipo Popular / raya de poncho |
  | `--poncho-azul` | `#2C4A7A` | Raya de poncho |

- **Tipografía** (elegida): **Bricolage Grotesque** (títulos) + **Figtree** (texto), de Google Fonts.
- **Ilustraciones:** SVG de trazo, línea dorada sobre azul, estilo marcador: torito, iglesia de tres torres, la Virgen, el Cotopaxi. Mismo grosor y remates redondeados. La raya de poncho se usa como acento puntual, nunca como relleno decorativo.
- No se usa nada del diseño del tríptico. Las fotos de referencia (`docs/research/fotos/`) informan el ambiente (luz de atardecer, ponchos, banderines), pero no se ponen en la interfaz.

## 7. Datos

- Un archivo `data/programa.json` es la única fuente. Cada actividad tiene:
  - `id`, `fecha` (YYYY-MM-DD), `hora` (HH:MM), `horaFin` (opcional), `titulo`, `tipo` (religioso | cultural | popular | deportivo), `lugar` (clave de un catálogo de lugares), `detalle` (texto del programa: quién celebra, anima o organiza), `gentileza` (lista de nombres), `destacado` (bool), `queEs` (opcional, con fuente).
- Catálogo `lugares`: clave → nombre visible + consulta o coordenadas para Google Maps.
- La transcripción sale del tríptico, **literal**. Solo se corrigen tildes evidentes ("Sabado" → "Sábado") y el formato de hora ("14H00" → "14:00").
- La novena se numera del día 1 (viernes 13) al día 9 (Misa de Vísperas, sábado 21), según confirmó la familia.

## 8. Redacción

- **Usted** en invitación, estado, recordatorios y agradecimientos. Botones en infinitivo neutro: "Ver el programa", "Agregar al calendario", "Cómo llegar", "Compartir".
- Se conserva el léxico del barrio: Priostes, priostazgo, gentileza de, Nuestra Patrona, Santísima Virgen de El Quinche, vísperas, novena, posada, albazos, chamarasca, quemazón, entrada de frutas y confites, colchas, ponchos y presentes taurinos, minga, canelas, banda de pueblo.
- Sin anglicismos y sin exclamaciones en serie. Los adjetivos del programa ("prestigiosa", "exquisitas") se quedan solo dentro de los nombres de las actividades.
- Cierre / firma: "Raíces fuertes, tradiciones vivas."

## 9. Compartir y vista previa

- `og:title`, `og:description` y `og:image` (1200×630, ilustración de línea dorada sobre azul) para la vista previa de WhatsApp.
- Compartir usa Web Share API. Si no está disponible: abrir WhatsApp con el texto y el enlace, o copiar el enlace.
- Compartir una actividad abre el sitio en esa actividad (`#a/<id>`).

## 10. Calidad y pruebas

- Pruebas automatizadas (Node, sin dependencias) de: generación `.ics` (fechas en UTC, VALARM, escape de texto), cálculo de "ahora / lo próximo" con hora del Ecuador, y validación de `programa.json` (tipos, fechas en rango, lugares existentes).
- Capturas con Playwright en viewport iPhone y Android, incluida una corrida con el teléfono en otra zona horaria para comprobar que "ahora" sigue la hora del Ecuador.
- Prueba manual en un iPhone y un Android reales antes de difundir (añadir a calendario, recordatorios, Cómo llegar, compartir).

## 11. Decisiones tras la revisión del constructor

**Respondidas por la conversación**
- **Plazo:** se construye completo hoy (13 nov), sin recortar alcance (decisión de la usuaria).
- **Ilustraciones:** las dibuja el constructor en SVG. Referencia de la iglesia: la portada del tríptico (tres torres blancas con cruces, la central más alta). La familia revisa la Virgen en la vista previa antes de difundir.

**Llamadas del diseñador** (la usuaria puede corregirlas)
- **Posadas de la novena** (casas particulares): se muestra el nombre de la familia anfitriona, pero **no** "Cómo llegar" ni ubicación, para no publicar domicilios.
- **Actividades sin lugar en el programa** (canelas, quemazón, pirotecnia…): se muestran como "Barrio Río Blanco Alto" y "Cómo llegar" lleva a la iglesia del barrio.
- **Tipos:** el constructor propone la clasificación (p. ej. Concurso de Lazo y Paseo del Chagra = Cultural; GIRO-RBA, fútbol y ecuavóley = Deportivo; toros, gallos, canelas, quemazón, baile = Popular; misas, novena, procesión, serenatas a la Virgen = Religioso) y la familia la revisa en la vista previa.

**Pendientes de la usuaria**
- Ubicación exacta (enlace de Google Maps) de los lugares del programa.
- Quién corrige el programa si cambia un horario durante la fiesta.
- Repositorio público para GitHub Pages (o plan pago) y si se usa `*.github.io` o un dominio propio.

## 12. Queda a criterio del constructor

- Estructura de archivos, nombres internos y estilo de código.
- Microanimaciones de transición (respetando `prefers-reduced-motion`).
- Detección del sistema operativo para ordenar opciones del calendario.


## Cambios decididos por la usuaria (13 de noviembre, tarde)

Estos puntos reemplazan lo que diga el resto del documento.

- **Color:** el azul noche pasa a **negro** (`--noche: #0A0908`); el dorado es el único acento. Los enlaces usan dorado oscuro (`#7A560E`).
- **Portada:** fondo negro con la **cara de un toro** en línea dorada, de frente, serio pero no agresivo, sin cuerpo. Respira y resopla humo; suben chispas. Textos: «Fiestas de Río Blanco Alto» y el lema. Pasa sola al Inicio (~4,6 s; ~1,2 s con movimiento reducido), con desvanecido y desaceleración; un toque la salta.
- **Inicio:** solo «Fiestas en honor a la Santísima Virgen de El Quinche» y las fechas. Tarjetas de «Lo más esperado» con degradado dorado sobre la foto. Sin banderines ni franjas decorativas.
- **Programa:** la lista no cambia. Se agrega **Buscar** en la barra superior: busca en todo el programa por actividad, lugar o persona y abre el detalle.
- **Detalle:** degradado dorado bajo el título. Las gentilezas dicen qué aportó cada quien cuando el tríptico lo indica.
- **Gracias** (antes «Gratitud»): etiqueta visible en el buscador, Priostes en tarjeta crema, filtro por día, y cada nombre abre una tarjeta de agradecimiento para enviar. Incluye posadas, quienes están a cargo, quienes animan o se presentan y los Priostes salientes, además de las gentilezas. Cierra con el **agradecimiento textual** del tríptico. Sin botón «Quiero colaborar».
- **Nombres:** se muestran tal como están en el programa impreso; no se cambia ninguno.
