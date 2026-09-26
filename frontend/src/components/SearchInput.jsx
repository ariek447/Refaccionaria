import Icon from './Icons.jsx';

export default function SearchInput({ value, onChange, placeholder = 'Buscar…' }) {
  return (
    <label className="search">
      <Icon name="search" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </label>
  );
}
