import { Link } from 'react-router';
import { dashboardApi } from '../api/client.js';
import Icon from '../components/Icons.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { ErrorState, Loader } from '../components/StatusViews.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { formatCurrency, formatDate, fullName, orDash } from '../utils/format.js';
import StockBadge from './parts/StockBadge.jsx';

function StatCard({ label, value, icon, to, tone = 'primary' }) {
  return (
    <Link to={to} className={`stat-card stat-card--${tone}`}>
      <span className="stat-card__icon">
        <Icon name={icon} size={22} />
      </span>
      <span>
        <span className="stat-card__value">{value}</span>
        <span className="stat-card__label">{label}</span>
      </span>
    </Link>
  );
}

/** Tarjeta con una tabla simple de resumen. */
function SummaryCard({ title, linkTo, headers, rows, emptyText }) {
  return (
    <article className="card">
      <header className="card__header">
        <h2>{title}</h2>
        <Link to={linkTo} className="link">
          Ver todo →
        </Link>
      </header>
      {rows.length === 0 ? (
        <p className="muted">{emptyText}</p>
      ) : (
        <div className="table-wrapper">
          <table className="table table--compact">
            <thead>
              <tr>
                {headers.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ id, cells }) => (
                <tr key={id}>
                  {cells.map((cell, index) => (
                    <td key={headers[index]} data-label={headers[index]}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}

export default function DashboardPage() {
  const { data, loading, error, reload } = useFetch(dashboardApi.get);

  return (
    <section>
      <PageHeader title="Dashboard" description="Resumen general de la refaccionaria." />

      {loading && <Loader />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && !loading && (
        <>
          <div className="stats-grid">
            <StatCard label="Usuarios" value={data.totals.users} icon="users" to="/usuarios" />
            <StatCard label="Automóviles" value={data.totals.cars} icon="car" to="/automoviles" />
            <StatCard label="Piezas" value={data.totals.parts} icon="part" to="/piezas" />
            <StatCard
              label={`Stock bajo (≤ ${data.lowStockThreshold})`}
              value={data.totals.lowStockParts}
              icon="alert"
              to="/piezas?stock=bajo"
              tone={data.totals.lowStockParts > 0 ? 'warning' : 'success'}
            />
            <StatCard
              label="Valor del inventario"
              value={formatCurrency(data.inventoryValue)}
              icon="money"
              to="/piezas"
              tone="success"
            />
          </div>

          <div className="dashboard-grid">
            <SummaryCard
              title="Piezas con stock bajo"
              linkTo="/piezas?stock=bajo"
              headers={['Pieza', 'No. de parte', 'Stock']}
              emptyText="Todas las piezas tienen stock suficiente."
              rows={data.lowStockParts.map((part) => ({
                id: part.id,
                cells: [part.name, part.part_number, <StockBadge key="stock" stock={part.stock} />],
              }))}
            />
            <SummaryCard
              title="Automóviles recientes"
              linkTo="/automoviles"
              headers={['Automóvil', 'Placas', 'Propietario']}
              emptyText="Aún no hay automóviles registrados."
              rows={data.recentCars.map((car) => ({
                id: car.id,
                cells: [`${car.brand} ${car.model} ${car.year}`, car.license_plate, fullName(car.owner)],
              }))}
            />
            <SummaryCard
              title="Usuarios recientes"
              linkTo="/usuarios"
              headers={['Nombre', 'Teléfono', 'Correo', 'Registro']}
              emptyText="Aún no hay usuarios registrados."
              rows={data.recentUsers.map((user) => ({
                id: user.id,
                cells: [fullName(user), user.phone, orDash(user.email), formatDate(user.created_at)],
              }))}
            />
          </div>
        </>
      )}
    </section>
  );
}
