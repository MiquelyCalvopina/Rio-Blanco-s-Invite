// Pone un sello de versión nuevo en los archivos que carga la página (?v=...),
// para que el navegador no muestre una versión guardada después de publicar.
// Uso: npm run sellar (antes de cada publicación)
import { readFileSync, writeFileSync } from 'node:fs';

const sello = new Date().toISOString().replace(/\D/g, '').slice(0, 12);
const raiz = new URL('../', import.meta.url);
for (const archivo of ['index.html', 'js/app.js']) {
  const ruta = new URL(archivo, raiz);
  const antes = readFileSync(ruta, 'utf8');
  const despues = antes.replace(/(\.(?:css|js))\?v=\w+/g, `$1?v=${sello}`);
  writeFileSync(ruta, despues);
  console.log(`${archivo}: ${(despues.match(/\?v=/g) || []).length} sellos → ${sello}`);
}
