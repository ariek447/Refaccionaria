// Validaciones del lado del cliente (el backend vuelve a validar todo).
// Cada función recibe los valores del formulario y devuelve { campo: mensaje }.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s()-]{7,20}$/;
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/i;
const PLATE_PATTERN = /^[A-Z0-9-]{5,15}$/i;

const isBlank = (value) => String(value ?? '').trim() === '';

export function validateUser(values) {
  const errors = {};
  if (isBlank(values.first_name)) errors.first_name = 'El nombre es obligatorio.';
  if (isBlank(values.last_name)) errors.last_name = 'El apellido es obligatorio.';
  if (isBlank(values.phone)) errors.phone = 'El teléfono es obligatorio.';
  else if (!PHONE_PATTERN.test(values.phone.trim())) {
    errors.phone = 'El teléfono debe tener entre 7 y 20 dígitos.';
  }
  if (!isBlank(values.email) && !EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'El correo electrónico no tiene un formato válido.';
  }
  return errors;
}

export function validateCar(values) {
  const errors = {};
  const year = Number(values.year);
  const maxYear = new Date().getFullYear() + 1;

  if (isBlank(values.user_id)) errors.user_id = 'Selecciona un propietario.';
  if (isBlank(values.brand)) errors.brand = 'La marca es obligatoria.';
  if (isBlank(values.model)) errors.model = 'El modelo es obligatorio.';
  if (!Number.isInteger(year) || year < 1900 || year > maxYear) {
    errors.year = `El año debe estar entre 1900 y ${maxYear}.`;
  }
  if (!PLATE_PATTERN.test(String(values.license_plate).trim())) {
    errors.license_plate = 'Placas inválidas: usa letras, números y guiones (5 a 15).';
  }
  if (!VIN_PATTERN.test(String(values.vin).trim())) {
    errors.vin = 'El VIN debe tener 17 caracteres alfanuméricos (sin I, O ni Q).';
  }
  return errors;
}

export function validatePart(values) {
  const errors = {};
  const price = Number(values.price);
  const stock = Number(values.stock);

  if (isBlank(values.name)) errors.name = 'El nombre es obligatorio.';
  if (isBlank(values.part_number)) errors.part_number = 'El número de parte es obligatorio.';
  if (isBlank(values.price) || !Number.isFinite(price) || price < 0) {
    errors.price = 'El precio debe ser un número mayor o igual a 0.';
  }
  if (isBlank(values.stock) || !Number.isInteger(stock) || stock < 0) {
    errors.stock = 'El stock debe ser un número entero mayor o igual a 0.';
  }
  return errors;
}
