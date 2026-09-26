import { FormActions, FormField } from '../../components/Form.jsx';
import { toFormValues, useForm } from '../../hooks/useForm.js';
import { validateUser } from '../../utils/validators.js';

const EMPTY_USER = { first_name: '', last_name: '', phone: '', email: '', address: '' };

export default function UserForm({ user, onSubmit, onCancel }) {
  const form = useForm(toFormValues(EMPTY_USER, user), validateUser);

  return (
    <form className="form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <div className="form-grid">
        <FormField label="Nombre" name="first_name" form={form} required maxLength={80} />
        <FormField label="Apellido" name="last_name" form={form} required maxLength={80} />
        <FormField label="Teléfono" name="phone" form={form} required type="tel" maxLength={20} placeholder="6141234567" />
        <FormField label="Correo electrónico" name="email" form={form} type="email" maxLength={120} placeholder="cliente@correo.com" />
        <FormField label="Dirección" name="address" form={form} maxLength={255} wide />
      </div>
      <FormActions submitting={form.submitting} isEdit={Boolean(user)} onCancel={onCancel} />
    </form>
  );
}
