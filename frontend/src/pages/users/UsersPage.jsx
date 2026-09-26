import { useState } from 'react';
import { usersApi } from '../../api/client.js';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import DataTable from '../../components/DataTable.jsx';
import Modal from '../../components/Modal.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import SearchInput from '../../components/SearchInput.jsx';
import { EmptyState, ListContent } from '../../components/StatusViews.jsx';
import { useCrud } from '../../hooks/useCrud.js';
import { formatDate, fullName, matchesSearch, orDash } from '../../utils/format.js';
import UserDetails from './UserDetails.jsx';
import UserForm from './UserForm.jsx';

const MESSAGES = {
  created: 'Usuario creado correctamente.',
  updated: 'Usuario actualizado correctamente.',
  deleted: 'Usuario eliminado correctamente.',
  createError: 'No se pudo crear el usuario.',
  updateError: 'No se pudo actualizar el usuario.',
  deleteError: 'No se pudo eliminar el usuario.',
};

const COLUMNS = [
  { label: 'Nombre', render: (user) => <strong>{fullName(user)}</strong> },
  { label: 'Teléfono', render: (user) => user.phone },
  { label: 'Correo', render: (user) => orDash(user.email) },
  { label: 'Dirección', render: (user) => orDash(user.address) },
  { label: 'Registro', render: (user) => formatDate(user.created_at) },
];

export default function UsersPage() {
  const { items: users, loading, error, reload, save, remove } = useCrud(usersApi, MESSAGES);
  const [search, setSearch] = useState('');
  // dialog.type: 'form' | 'details' | 'delete'; dialog.user: registro seleccionado
  const [dialog, setDialog] = useState({ type: null, user: null });

  const openDialog = (type, user = null) => setDialog({ type, user });
  const closeDialog = () => setDialog({ type: null, user: null });

  const handleSave = async (values) => {
    await save(values, dialog.user?.id);
    closeDialog();
  };

  const handleDelete = async () => {
    await remove(dialog.user.id);
    closeDialog();
  };

  const filteredUsers = users.filter((user) =>
    matchesSearch([user.first_name, user.last_name, user.phone, user.email, user.address], search),
  );

  return (
    <section>
      <PageHeader
        title="Usuarios"
        description="Clientes de la refaccionaria."
        addLabel="Agregar usuario"
        onAdd={() => openDialog('form')}
      />

      <ListContent
        loading={loading}
        error={error}
        onRetry={reload}
        isEmpty={users.length === 0}
        empty={
          <EmptyState
            title="Aún no hay usuarios registrados"
            text="Registra al primer cliente para poder asignarle automóviles."
          />
        }
      >
        <div className="toolbar">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre, teléfono o correo…" />
          <span className="muted">{filteredUsers.length} de {users.length}</span>
        </div>
        <DataTable
          columns={COLUMNS}
          rows={filteredUsers}
          onView={(user) => openDialog('details', user)}
          onEdit={(user) => openDialog('form', user)}
          onDelete={(user) => openDialog('delete', user)}
        />
      </ListContent>

      <Modal
        open={dialog.type === 'form'}
        title={dialog.user ? 'Editar usuario' : 'Nuevo usuario'}
        onClose={closeDialog}
      >
        <UserForm user={dialog.user} onSubmit={handleSave} onCancel={closeDialog} />
      </Modal>

      <Modal open={dialog.type === 'details'} title="Detalle del usuario" onClose={closeDialog}>
        {dialog.user && <UserDetails userId={dialog.user.id} />}
      </Modal>

      <ConfirmDialog
        open={dialog.type === 'delete'}
        title="Eliminar usuario"
        message={`¿Seguro que deseas eliminar a "${fullName(dialog.user)}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onClose={closeDialog}
      />
    </section>
  );
}
