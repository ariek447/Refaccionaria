import Icon from './Icons.jsx';

/**
 * Tabla genérica con acciones Ver / Editar / Eliminar.
 * columns: [{ label, render: (row) => contenido }]
 * En móvil cada fila se muestra como tarjeta usando data-label (ver CSS).
 */
export default function DataTable({ columns, rows, onView, onEdit, onDelete }) {
  if (rows.length === 0) {
    return <p className="table-empty">No se encontraron resultados con esos filtros.</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.label}>{column.label}</th>
            ))}
            <th className="table__actions-header">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.label} data-label={column.label}>
                  {column.render(row)}
                </td>
              ))}
              <td className="table__actions">
                <button type="button" className="icon-button" title="Ver detalle" aria-label="Ver detalle" onClick={() => onView(row)}>
                  <Icon name="eye" />
                </button>
                <button type="button" className="icon-button" title="Editar" aria-label="Editar" onClick={() => onEdit(row)}>
                  <Icon name="edit" />
                </button>
                <button
                  type="button"
                  className="icon-button icon-button--danger"
                  title="Eliminar"
                  aria-label="Eliminar"
                  onClick={() => onDelete(row)}
                >
                  <Icon name="trash" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
