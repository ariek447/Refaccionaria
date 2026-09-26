import { createCrudController } from './crudController.js';
import { partsService } from '../services/parts.service.js';

export const partsController = createCrudController(partsService, {
  deleted: 'Pieza eliminada correctamente.',
});
