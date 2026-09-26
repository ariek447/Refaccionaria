import { Link } from 'react-router';
import DetailList from '../../components/DetailList.jsx';
import { ErrorState, Loader } from '../../components/StatusViews.jsx';
import { usersApi } from '../../api/client.js';
import { useFetch } from '../../hooks/useFetch.js';
import { formatDate, fullName, orDash } from '../../utils/format.js';

/** Consulta GET /api/users/:id, que incluye los automóviles del usuario. */
export default function UserDetails({ userId }) {
  const { data: user, loading, error, reload } = useFetch(() => usersApi.get(userId), [userId]);

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <>
      <DetailList
        items={[
          { label: 'Nombre', value: fullName(user) },
          { label: 'Teléfono', value: user.phone },
          { label: 'Correo', value: orDash(user.email) },
          { label: 'Dirección', value: orDash(user.address) },
          { label: 'Fecha de registro', value: formatDate(user.created_at) },
        ]}
      />

      <h3 className="section-title">Automóviles ({user.cars.length})</h3>
      {user.cars.length === 0 ? (
        <p className="muted">Este usuario no tiene automóviles registrados.</p>
      ) : (
        <>
          <ul className="simple-list">
            {user.cars.map((car) => (
              <li key={car.id}>
                <strong>
                  {car.brand} {car.model} {car.year}
                </strong>
                <span className="muted">
                  {car.license_plate} · {car.vin}
                </span>
              </li>
            ))}
          </ul>
          <Link to={`/automoviles?propietario=${user.id}`} className="link">
            Ver en la sección de automóviles →
          </Link>
        </>
      )}
    </>
  );
}
