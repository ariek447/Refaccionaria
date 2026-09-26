import { useState } from 'react';

/**
 * Construye los valores iniciales de un formulario: toma los campos de
 * "emptyValues" y, si se está editando, los rellena con los del registro.
 */
export function toFormValues(emptyValues, record) {
  return Object.fromEntries(
    Object.keys(emptyValues).map((key) => [key, record?.[key] ?? emptyValues[key]]),
  );
}

/**
 * Estado de un formulario controlado con validación.
 * @param {object} initialValues Valores iniciales
 * @param {function} validate    (values) => { campo: mensaje }
 */
export function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = (onSubmit) => async (event) => {
    event.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      // Errores por campo devueltos por el backend (400)
      if (err.details) setErrors(err.details);
    } finally {
      setSubmitting(false);
    }
  };

  return { values, errors, submitting, handleChange, handleSubmit };
}
