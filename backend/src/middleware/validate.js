import { HttpError } from '../utils/httpError.js';

const isEmpty = (value) => value === undefined || value === null || value === '';

function validateString(value, rules) {
  if (typeof value !== 'string') return { error: `${rules.label} debe ser texto.` };

  // Sanitización: quitar espacios sobrantes y normalizar mayúsculas/minúsculas
  let text = value.trim().replace(/\s+/g, ' ');
  if (rules.transform === 'uppercase') text = text.toUpperCase();
  if (rules.transform === 'lowercase') text = text.toLowerCase();

  if (text === '') return { value: null };
  if (rules.max && text.length > rules.max) {
    return { error: `${rules.label} no puede tener más de ${rules.max} caracteres.` };
  }
  if (rules.pattern && !rules.pattern.test(text)) return { error: rules.patternMessage };
  return { value: text };
}

function validateNumber(value, rules) {
  const number = typeof value === 'string' ? Number(value.trim()) : value;

  if (typeof number !== 'number' || !Number.isFinite(number)) {
    return { error: `${rules.label} debe ser un número.` };
  }
  if (rules.type === 'integer' && !Number.isInteger(number)) {
    return { error: `${rules.label} debe ser un número entero.` };
  }
  if (rules.min !== undefined && number < rules.min) {
    return { error: `${rules.label} debe ser mayor o igual a ${rules.min}.` };
  }
  if (rules.max !== undefined && number > rules.max) {
    return { error: `${rules.label} debe ser menor o igual a ${rules.max}.` };
  }
  return { value: rules.decimals ? Number(number.toFixed(rules.decimals)) : number };
}

function validateField(value, rules) {
  if (isEmpty(value)) return { value: null };
  return rules.type === 'string' ? validateString(value, rules) : validateNumber(value, rules);
}

/**
 * Valida y limpia req.body según un esquema (ver validators/schemas.js).
 * - Solo conserva los campos definidos en el esquema (ignora id, created_at, etc.).
 * - Si hay errores responde 400 con el detalle por campo.
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const data = {};
    const errors = {};

    for (const [field, rules] of Object.entries(schema)) {
      const { value, error } = validateField(body[field], rules);

      if (error) errors[field] = error;
      else if (value === null && rules.required) errors[field] = `${rules.label} es obligatorio.`;
      else data[field] = value;
    }

    if (Object.keys(errors).length > 0) {
      return next(new HttpError(400, 'Los datos enviados no son válidos.', errors));
    }

    req.body = data;
    next();
  };
}

/** Verifica que :id sea un entero positivo. */
export function validateIdParam(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return next(new HttpError(400, 'El id debe ser un número entero positivo.'));
  }
  req.params.id = id;
  next();
}
