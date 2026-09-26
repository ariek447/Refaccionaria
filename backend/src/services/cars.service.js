import { createCrudService } from './crudService.js';

export const carsService = createCrudService({
  table: 'cars',
  // "owner:users(...)" hace el JOIN con la tabla users usando la FK user_id
  listSelect: '*, owner:users(id, first_name, last_name, phone, email)',
  messages: {
    notFound: 'Automóvil no encontrado.',
    unique: {
      cars_vin_key: 'Ya existe un automóvil con ese VIN.',
      cars_license_plate_key: 'Ya existe un automóvil con esas placas.',
    },
    foreignKey: { status: 400, message: 'El propietario seleccionado no existe.' },
  },
});
