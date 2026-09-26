import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { carsApi, usersApi } from '../../api/client.js';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import DataTable from '../../components/DataTable.jsx';
import Modal from '../../components/Modal.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import SearchInput from '../../components/SearchInput.jsx';
import { EmptyState, ListContent, Loader } from '../../components/StatusViews.jsx';
import { useCrud } from '../../hooks/useCrud.js';
import { useFetch } from '../../hooks/useFetch.js';
import { formatDate, fullName, matchesSearch, orDash } from '../../utils/format.js';
import CarDetails from './CarDetails.jsx';
import CarForm from './CarForm.jsx';

const MESSAGES = {
  created: 'Automóvil creado correctamente.',
  updated: 'Automóvil actualizado correctamente.',
  deleted: 'Automóvil eliminado correctamente.',
  createError: 'No se pudo crear el automóvil.',
  updateError: 'No se pudo actualizar el automóvil.',
  deleteError: 'No se pudo eliminar el automóvil.',
};

const COLUMNS = [
  {
    label: 'Automóvil',
    render: (car) => (
      <strong>
        {car.brand} {car.model}
      </strong>
    ),
  },
  { label: 'Año', render: (car) => car.year },
  { label: 'Color', render: (car) => orDash(car.color) },
  { label: 'Placas', render: (car) => <span className="mono">{car.license_plate}</span> },
  { label: 'VIN', render: (car) => <span className="mono">{car.vin}</span> },
  { label: 'Propietario', render: (car) => fullName(car.owner) },
  { label: 'Registro', render: (car) => formatDate(car.created_at) },
];

export default function CarsPage() {
  const { items: cars, loading, error, reload, save, remove } = useCrud(carsApi, MESSAGES);
  // Lista de usuarios para el selector de propietario y el filtro
  const { data: users, loading: usersLoading } = useFetch(usersApi.list);
  const [search, setSearch] = useState('');
  // El filtro por propietario vive en la URL: /automoviles?propietario=3
  const [searchParams, setSearchParams] = useSearchParams();
  const ownerFilter = searchParams.get('propietario') || '';
  const [dialog, setDialog] = useState({ type: null, car: null });

  const openDialog = (type, car = null) => setDialog({ type, car });
  const closeDialog = () => setDialog({ type: null, car: null });

  const handleOwnerFilter = (userId) => setSearchParams(userId ? { propietario: userId } : {});

  const handleSave = async (values) => {
    await save(values, dialog.car?.id);
    closeDialog();
  };

  const handleDelete = async () => {
    await remove(dialog.car.id);
    closeDialog();
  };

  const filteredCars = cars.filter(
    (car) =>
      (!ownerFilter || String(car.user_id) === ownerFilter) &&
      matchesSearch([car.brand, car.model, car.year, car.license_plate, car.vin, fullName(car.owner)], search),
  );

  const hasUsers = (users?.length ?? 0) > 0;

  return (
    <section>
      <PageHeader
        title="Automóviles"
        description="Vehículos de los clientes y su propietario."
        addLabel="Agregar automóvil"
        onAdd={() => openDialog('form')}
      />

      <ListContent
        loading={loading}
        error={error}
        onRetry={reload}
        isEmpty={cars.length === 0}
        empty={
          <EmptyState
            title="Aún no hay automóviles registrados"
            text={hasUsers ? 'Agrega el primer automóvil y asígnale un propietario.' : 'Primero registra un usuario para poder asignarle un automóvil.'}
            action={
              !hasUsers && (
                <Link to="/usuarios" className="button button--secondary">
                  Ir a Usuarios
                </Link>
              )
            }
          />
        }
      >
        <div className="toolbar">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por marca, placas, VIN o propietario…" />
          <select
            className="select"
            value={ownerFilter}
            onChange={(event) => handleOwnerFilter(event.target.value)}
            aria-label="Filtrar por propietario"
          >
            <option value="">Todos los propietarios</option>
            {users?.map((user) => (
              <option key={user.id} value={user.id}>
                {fullName(user)}
              </option>
            ))}
          </select>
          <span className="muted">{filteredCars.length} de {cars.length}</span>
        </div>
        <DataTable
          columns={COLUMNS}
          rows={filteredCars}
          onView={(car) => openDialog('details', car)}
          onEdit={(car) => openDialog('form', car)}
          onDelete={(car) => openDialog('delete', car)}
        />
      </ListContent>

      <Modal
        open={dialog.type === 'form'}
        title={dialog.car ? 'Editar automóvil' : 'Nuevo automóvil'}
        onClose={closeDialog}
      >
        {usersLoading ? (
          <Loader />
        ) : hasUsers ? (
          <CarForm car={dialog.car} users={users} onSubmit={handleSave} onCancel={closeDialog} />
        ) : (
          <EmptyState
            title="No hay usuarios registrados"
            text="Cada automóvil necesita un propietario. Registra primero un usuario."
            action={
              <Link to="/usuarios" className="button">
                Ir a Usuarios
              </Link>
            }
          />
        )}
      </Modal>

      <Modal open={dialog.type === 'details'} title="Detalle del automóvil" onClose={closeDialog}>
        {dialog.car && <CarDetails carId={dialog.car.id} />}
      </Modal>

      <ConfirmDialog
        open={dialog.type === 'delete'}
        title="Eliminar automóvil"
        message={`¿Seguro que deseas eliminar el automóvil "${dialog.car?.brand} ${dialog.car?.model}" con placas ${dialog.car?.license_plate}?`}
        onConfirm={handleDelete}
        onClose={closeDialog}
      />
    </section>
  );
}
