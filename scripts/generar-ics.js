// Genera ics/<id>.ics, ics/todo.ics e ics/destacados.ics a partir de data/programa.json.
// Uso: npm run ics
import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { icsCalendario, SELLO_ICS } from '../js/nucleo.js';

const raiz = new URL('../', import.meta.url);
const datos = JSON.parse(readFileSync(new URL('data/programa.json', raiz)));
const dir = new URL('ics/', raiz);
mkdirSync(dir, { recursive: true });
for (const f of readdirSync(dir)) if (f.endsWith('.ics')) unlinkSync(new URL(f, dir));

const { actividades, lugares } = datos;
for (const a of actividades) {
  writeFileSync(new URL(`${a.id}.ics`, dir), icsCalendario([a], lugares, SELLO_ICS));
}
writeFileSync(new URL('todo.ics', dir), icsCalendario(actividades, lugares, SELLO_ICS));
writeFileSync(new URL('destacados.ics', dir), icsCalendario(actividades.filter((a) => a.destacado), lugares, SELLO_ICS));
console.log(`Generados ${actividades.length + 2} archivos .ics`);
