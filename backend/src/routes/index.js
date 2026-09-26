import { Router } from 'express';
import { createCrudRouter } from './crudRoutes.js';
import { login } from '../controllers/auth.controller.js';
import { usersController } from '../controllers/users.controller.js';
import { carsController } from '../controllers/cars.controller.js';
import { partsController } from '../controllers/parts.controller.js';
import { getDashboard } from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { loginRateLimit } from '../middleware/loginRateLimit.js';
import { userSchema, carSchema, partSchema } from '../validators/schemas.js';

const router = Router();

// ---------- Rutas públicas ----------
// Usado por Render para verificar que el servicio está vivo
router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.post('/login', loginRateLimit, login);

// ---------- Rutas protegidas: todo lo que sigue exige token ----------
router.use(requireAuth);

router.get('/dashboard', getDashboard);
router.use('/users', createCrudRouter(usersController, userSchema));
router.use('/cars', createCrudRouter(carsController, carSchema));
router.use('/parts', createCrudRouter(partsController, partSchema));

export default router;
