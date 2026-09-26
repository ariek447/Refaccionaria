import { createCrudController } from './crudController.js';
import { usersService } from '../services/users.service.js';

export const usersController = createCrudController(usersService, {
  deleted: 'Usuario eliminado correctamente.',
});
