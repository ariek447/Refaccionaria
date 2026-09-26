import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// En local no hace falta el build del frontend (Vite corre aparte).
// En Render, RENDER=true: se genera frontend/dist para que Express lo sirva.
if (!process.env.RENDER) {
  process.exit(0);
}

const frontendDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../frontend');

console.log('Construyendo el frontend para producción…');
execSync('npm install && npm run build', { cwd: frontendDir, stdio: 'inherit' });
