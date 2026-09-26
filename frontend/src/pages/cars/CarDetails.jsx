import DetailList from '../../components/DetailList.jsx';
import { ErrorState, Loader } from '../../components/StatusViews.jsx';
import { carsApi } from '../../api/client.js';
import { useFetch } from '../../hooks/useFetch.js';
import { formatDate, fullName, orDash } from '../../utils/format.js';

/** Consulta GET /api/cars/:id, que incluye los datos del propietario. */
export default function CarDetails({ carId }) {
  const { data: car, loading, error, reload } = useFetch(() => carsApi.get(carId), [carId]);

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <>
      <DetailList
        items={[
          { label: 'Marca', value: car.brand },
          { label: 'Modelo', value: car.model },
          { label: 'Año', value: car.year },
          { label: 'Color', value: orDash(car.color) },
          { label: 'Placas', value: car.license_plate },
          { label: 'VIN', value: car.vin },
          { label: 'Fecha de registro', value: formatDate(car.created_at) },
        ]}
      />

      <h3 className="section-title">Propietario</h3>
      <DetailList
        items={[
          { label: 'Nombre', value: fullName(car.owner) },
          { label: 'Teléfono', value: orDash(car.owner?.phone) },
          { label: 'Correo', value: orDash(car.owner?.email) },
        ]}
      />
    </>
  );
}
