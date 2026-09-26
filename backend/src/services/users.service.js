import { createCrudService } from './crudService.js';

export const usersService = createCrudService({
  table: 'users',
  // Al consultar un usuario también se devuelven sus automóviles (relación 1:N)
  detailSelect: '*, cars(id, brand, model, year, color, license_plate, vin)',
  messages: {
    notFound: 'Usuario no encontrado.',
    unique: { users_email_key: 'Ya existe un usuario con ese correo electrónico.' },
    // La FK cars.user_id usa ON DELETE RESTRICT
    foreignKey: {
      status: 409,
      message: 'No se puede eliminar el usuario porque tiene automóviles registrados.',
    },
  },
});
