import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { corsOptions } from './config/cors.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// Render pone un proxy delante de la app: así req.ip es la IP real del cliente
// (la usa el límite de intentos de login)
app.set('trust proxy', 1);

app.use(helmet()); // Cabeceras HTTP de seguridad
app.use(cors(corsOptions)); // Solo el frontend autorizado puede llamar a la API
app.use(express.json({ limit: '10kb' })); // Limita el tamaño del body

app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// Render asigna el puerto mediante process.env.PORT
app.listen(env.port, () => {
  console.log(`API escuchando en el puerto ${env.port} (${env.nodeEnv})`);
});
