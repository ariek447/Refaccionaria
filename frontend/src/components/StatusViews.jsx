import Icon from './Icons.jsx';

export function Loader({ text = 'Cargando…' }) {
  return (
    <div className="status-view" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{text}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="status-view status-view--error" role="alert">
      <Icon name="alert" size={32} />
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="button button--secondary" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, text, action }) {
  return (
    <div className="status-view">
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

/** Decide qué mostrar en un listado: cargando, error, vacío o el contenido. */
export function ListContent({ loading, error, onRetry, isEmpty, empty, children }) {
  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (isEmpty) return empty;
  return children;
}
