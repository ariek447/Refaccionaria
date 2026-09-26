/**
 * Campo de formulario con etiqueta y mensaje de error.
 * "form" es el objeto devuelto por el hook useForm; "wide" ocupa todo el ancho.
 */
export function FormField({ label, name, form, as: Component = 'input', required, hint, wide, children, ...props }) {
  const id = `field-${name}`;
  const error = form.errors[name];

  return (
    <div className={wide ? 'field field--wide' : 'field'}>
      <label htmlFor={id}>
        {label}
        {required && <span className="required"> *</span>}
      </label>
      <Component
        id={id}
        name={name}
        value={form.values[name]}
        onChange={form.handleChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      >
        {children}
      </Component>
      {error ? (
        <small id={`${id}-error`} className="field__error">
          {error}
        </small>
      ) : (
        hint && <small className="field__hint">{hint}</small>
      )}
    </div>
  );
}

export function FormActions({ submitting, isEdit, onCancel }) {
  return (
    <div className="form-actions">
      <button type="button" className="button button--secondary" onClick={onCancel} disabled={submitting}>
        Cancelar
      </button>
      <button type="submit" className="button" disabled={submitting}>
        {submitting ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear'}
      </button>
    </div>
  );
}
