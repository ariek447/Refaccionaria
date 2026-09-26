import Icon from './Icons.jsx';

export default function PageHeader({ title, description, addLabel, onAdd }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {onAdd && (
        <button type="button" className="button" onClick={onAdd}>
          <Icon name="plus" /> {addLabel}
        </button>
      )}
    </header>
  );
}
