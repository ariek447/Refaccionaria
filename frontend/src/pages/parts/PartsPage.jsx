import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { partsApi } from '../../api/client.js';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import DataTable from '../../components/DataTable.jsx';
import Modal from '../../components/Modal.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import SearchInput from '../../components/SearchInput.jsx';
import { EmptyState, ListContent } from '../../components/StatusViews.jsx';
import { useCrud } from '../../hooks/useCrud.js';
import { formatCurrency, LOW_STOCK_THRESHOLD, matchesSearch, orDash } from '../../utils/format.js';
import PartDetails from './PartDetails.jsx';
import PartForm from './PartForm.jsx';
import StockBadge from './StockBadge.jsx';

const MESSAGES = {
  created: 'Pieza creada correctamente.',
  updated: 'Pieza actualizada correctamente.',
  deleted: 'Pieza eliminada correctamente.',
  createError: 'No se pudo crear la pieza.',
  updateError: 'No se pudo actualizar la pieza.',
  deleteError: 'No se pudo eliminar la pieza.',
};

const COLUMNS = [
  { label: 'Nombre', render: (part) => <strong>{part.name}</strong> },
  { label: 'No. de parte', render: (part) => <span className="mono">{part.part_number}</span> },
  { label: 'Categoría', render: (part) => orDash(part.category) },
  { label: 'Marca', render: (part) => orDash(part.brand) },
  { label: 'Precio', render: (part) => formatCurrency(part.price) },
  { label: 'Stock', render: (part) => <StockBadge stock={part.stock} /> },
];

export default function PartsPage() {
  const { items: parts, loading, error, reload, save, remove } = useCrud(partsApi, MESSAGES);
  const [search, setSearch] = useState('');
  // Filtro de stock bajo en la URL (/piezas?stock=bajo) para poder enlazarlo desde el dashboard
  const [searchParams, setSearchParams] = useSearchParams();
  const onlyLowStock = searchParams.get('stock') === 'bajo';
  const [dialog, setDialog] = useState({ type: null, part: null });

  const openDialog = (type, part = null) => setDialog({ type, part });
  const closeDialog = () => setDialog({ type: null, part: null });

  const handleSave = async (values) => {
    await save(values, dialog.part?.id);
    closeDialog();
  };

  const handleDelete = async () => {
    await remove(dialog.part.id);
    closeDialog();
  };

  const filteredParts = parts.filter(
    (part) =>
      (!onlyLowStock || part.stock <= LOW_STOCK_THRESHOLD) &&
      matchesSearch([part.name, part.part_number, part.category, part.brand, part.description], search),
  );

  return (
    <section>
      <PageHeader
        title="Piezas"
        description="Inventario de refacciones."
        addLabel="Agregar pieza"
        onAdd={() => openDialog('form')}
      />

      <ListContent
        loading={loading}
        error={error}
        onRetry={reload}
        isEmpty={parts.length === 0}
        empty={<EmptyState title="Aún no hay piezas registradas" text="Agrega la primera refacción al inventario." />}
      >
        <div className="toolbar">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre, número de parte, categoría…" />
          <label className="checkbox">
            <input
              type="checkbox"
              checked={onlyLowStock}
              onChange={(event) => setSearchParams(event.target.checked ? { stock: 'bajo' } : {})}
            />
            Solo stock bajo (≤ {LOW_STOCK_THRESHOLD})
          </label>
          <span className="muted">{filteredParts.length} de {parts.length}</span>
        </div>
        <DataTable
          columns={COLUMNS}
          rows={filteredParts}
          onView={(part) => openDialog('details', part)}
          onEdit={(part) => openDialog('form', part)}
          onDelete={(part) => openDialog('delete', part)}
        />
      </ListContent>

      <Modal
        open={dialog.type === 'form'}
        title={dialog.part ? 'Editar pieza' : 'Nueva pieza'}
        onClose={closeDialog}
      >
        <PartForm part={dialog.part} onSubmit={handleSave} onCancel={closeDialog} />
      </Modal>

      <Modal open={dialog.type === 'details'} title="Detalle de la pieza" onClose={closeDialog}>
        {dialog.part && <PartDetails partId={dialog.part.id} />}
      </Modal>

      <ConfirmDialog
        open={dialog.type === 'delete'}
        title="Eliminar pieza"
        message={`¿Seguro que deseas eliminar la pieza "${dialog.part?.name}" (${dialog.part?.part_number})?`}
        onConfirm={handleDelete}
        onClose={closeDialog}
      />
    </section>
  );
}
