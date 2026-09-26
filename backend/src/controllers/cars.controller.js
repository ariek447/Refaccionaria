import { createCrudController } from './crudController.js';
import { carsService } from '../services/cars.service.js';

export const carsController = createCrudController(carsService, {
  deleted: 'Automóvil eliminado correctamente.',
});
