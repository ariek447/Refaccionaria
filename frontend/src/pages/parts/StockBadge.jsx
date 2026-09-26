import { LOW_STOCK_THRESHOLD } from '../../utils/format.js';

export default function StockBadge({ stock }) {
  if (stock === 0) return <span className="badge badge--danger">Agotado</span>;
  if (stock <= LOW_STOCK_THRESHOLD) return <span className="badge badge--warning">{stock} · Bajo</span>;
  return <span className="badge badge--success">{stock}</span>;
}
