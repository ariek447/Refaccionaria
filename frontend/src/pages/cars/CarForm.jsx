import { FormActions, FormField } from '../../components/Form.jsx';
import { toFormValues, useForm } from '../../hooks/useForm.js';
import { fullName } from '../../utils/format.js';
import { validateCar } from '../../utils/validators.js';

const EMPTY_CAR = {
  user_id: '',
  brand: '',
  model: '',
  year: '',
  color: '',
  license_plate: '',
  vin: '',
};

/** users: lista de propietarios para el selector */
export default function CarForm({ car, users, onSubmit, onCancel }) {
  const form = useForm(toFormValues(EMPTY_CAR, car), validateCar);

  return (
    <form className="form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <div className="form-grid">
        <FormField label="Propietario" name="user_id" form={form} as="select" required wide>
          <option value="">Selecciona un usuario…</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {fullName(user)} — {user.phone}
            </option>
          ))}
        </FormField>
        <FormField label="Marca" name="brand" form={form} required maxLength={50} placeholder="Nissan" />
        <FormField label="Modelo" name="model" form={form} required maxLength={50} placeholder="Versa" />
        <FormField label="Año" name="year" form={form} required type="number" min={1900} max={new Date().getFullYear() + 1} placeholder="2020" />
        <FormField label="Color" name="color" form={form} maxLength={30} placeholder="Blanco" />
        <FormField label="Placas" name="license_plate" form={form} required maxLength={15} placeholder="ABC-123-A" />
        <FormField
          label="VIN / Número de serie"
          name="vin"
          form={form}
          required
          maxLength={17}
          placeholder="1HGCM82633A004352"
          hint="17 caracteres, sin las letras I, O ni Q."
        />
      </div>
      <FormActions submitting={form.submitting} isEdit={Boolean(car)} onCancel={onCancel} />
    </form>
  );
}
