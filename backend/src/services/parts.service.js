import { createCrudService } from './crudService.js';

export const partsService = createCrudService({
  table: 'parts',
  messages: {
    notFound: 'Pieza no encontrada.',
    unique: { parts_part_number_key: 'Ya existe una pieza con ese número de parte.' },
  },
});
