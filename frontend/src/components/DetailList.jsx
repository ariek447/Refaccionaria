/** Muestra pares etiqueta/valor. items: [{ label, value }] */
export default function DetailList({ items }) {
  return (
    <dl className="detail-list">
      {items.map(({ label, value }) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
