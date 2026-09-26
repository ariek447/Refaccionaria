import { Router } from 'express';
import { validateBody, validateIdParam } from '../middleware/validate.js';

/**
 * Rutas REST estándar de un recurso:
 *   GET    /       listar
 *   GET    /:id    consultar uno
 *   POST   /       crear       (valida el body)
 *   PUT    /:id    actualizar  (valida el body)
 *   DELETE /:id    eliminar
 */
export function createCrudRouter(controller, schema) {
  const router = Router();

  router.get('/', controller.list);
  router.get('/:id', validateIdParam, controller.getById);
  router.post('/', validateBody(schema), controller.create);
  router.put('/:id', validateIdParam, validateBody(schema), controller.update);
  router.delete('/:id', validateIdParam, controller.remove);

  return router;
}
