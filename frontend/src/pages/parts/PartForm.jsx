import { FormActions, FormField } from '../../components/Form.jsx';
import { toFormValues, useForm } from '../../hooks/useForm.js';
import { validatePart } from '../../utils/validators.js';

const EMPTY_PART = {
  name: '',
  part_number: '',
  category: '',
  brand: '',
  price: '',
  stock: '',
  description: '',
};

export default function PartForm({ part, onSubmit, onCancel }) {
  const form = useForm(toFormValues(EMPTY_PART, part), validatePart);

  return (
    <form className="form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <div className="form-grid">
        <FormField label="Nombre" name="name" form={form} required maxLength={100} placeholder="Filtro de aceite" />
        <FormField label="Número de parte" name="part_number" form={form} required maxLength={50} placeholder="BOS-0451103" />
        <FormField label="Categoría" name="category" form={form} maxLength={50} placeholder="Filtros" />
        <FormField label="Marca" name="brand" form={form} maxLength={50} placeholder="Bosch" />
        <FormField label="Precio (MXN)" name="price" form={form} required type="number" min={0} step="0.01" placeholder="0.00" />
        <FormField label="Stock" name="stock" form={form} required type="number" min={0} step="1" placeholder="0" />
        <FormField label="Descripción" name="description" form={form} as="textarea" rows={3} maxLength={1000} wide />
      </div>
      <FormActions submitting={form.submitting} isEdit={Boolean(part)} onCancel={onCancel} />
    </form>
  );
}
