import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// En local no hace falta el build del frontend (Vite corre aparte).
// En Render, RENDER=true: se genera frontend/dist para que Express lo sirva.
if (!process.env.RENDER) {
  process.exit(0);
}

const frontendDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../frontend');

if (!existsSync(path.join(frontendDir, 'package.json'))) {
  console.error(`No se encontró el frontend en ${frontendDir}`);
  console.error('En Render, Root Directory debe ser "backend" (el repo completo se clona igual).');
  process.exit(1);
}

console.log('Construyendo el frontend para producción…');
// Vite está en devDependencies: hay que instalarlas aunque Render use NODE_ENV=production.
execSync('npm install --include=dev && npm run build', {
  cwd: frontendDir,
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' },
});
