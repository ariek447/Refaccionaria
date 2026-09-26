// Reglas de validación de cada recurso. Las usa el middleware validateBody.
// type: 'string' | 'integer' | 'number'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s()-]{7,20}$/;
// VIN estándar (ISO 3779): 17 caracteres, sin las letras I, O, Q
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;
const PLATE_PATTERN = /^[A-Z0-9-]{5,15}$/;

export const userSchema = {
  first_name: { type: 'string', label: 'El nombre', required: true, max: 80 },
  last_name: { type: 'string', label: 'El apellido', required: true, max: 80 },
  phone: {
    type: 'string',
    label: 'El teléfono',
    required: true,
    max: 20,
    pattern: PHONE_PATTERN,
    patternMessage: 'El teléfono debe tener entre 7 y 20 dígitos.',
  },
  email: {
    type: 'string',
    label: 'El correo electrónico',
    max: 120,
    transform: 'lowercase',
    pattern: EMAIL_PATTERN,
    patternMessage: 'El correo electrónico no tiene un formato válido.',
  },
  address: { type: 'string', label: 'La dirección', max: 255 },
};

export const carSchema = {
  user_id: { type: 'integer', label: 'El propietario', required: true, min: 1 },
  brand: { type: 'string', label: 'La marca', required: true, max: 50 },
  model: { type: 'string', label: 'El modelo', required: true, max: 50 },
  year: {
    type: 'integer',
    label: 'El año',
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1,
  },
  color: { type: 'string', label: 'El color', max: 30 },
  license_plate: {
    type: 'string',
    label: 'Las placas',
    required: true,
    max: 15,
    transform: 'uppercase',
    pattern: PLATE_PATTERN,
    patternMessage: 'Las placas solo pueden contener letras, números y guiones (5 a 15).',
  },
  vin: {
    type: 'string',
    label: 'El VIN',
    required: true,
    max: 17,
    transform: 'uppercase',
    pattern: VIN_PATTERN,
    patternMessage: 'El VIN debe tener 17 caracteres alfanuméricos (sin I, O ni Q).',
  },
};

export const partSchema = {
  name: { type: 'string', label: 'El nombre', required: true, max: 100 },
  description: { type: 'string', label: 'La descripción', max: 1000 },
  category: { type: 'string', label: 'La categoría', max: 50 },
  brand: { type: 'string', label: 'La marca', max: 50 },
  part_number: {
    type: 'string',
    label: 'El número de parte',
    required: true,
    max: 50,
    transform: 'uppercase',
  },
  price: {
    type: 'number',
    label: 'El precio',
    required: true,
    min: 0,
    max: 99999999.99,
    decimals: 2,
  },
  stock: { type: 'integer', label: 'El stock', required: true, min: 0, max: 1000000 },
};
