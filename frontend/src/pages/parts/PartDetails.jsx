import DetailList from '../../components/DetailList.jsx';
import { ErrorState, Loader } from '../../components/StatusViews.jsx';
import { partsApi } from '../../api/client.js';
import { useFetch } from '../../hooks/useFetch.js';
import { formatCurrency, formatDate, orDash } from '../../utils/format.js';
import StockBadge from './StockBadge.jsx';

/** Consulta GET /api/parts/:id */
export default function PartDetails({ partId }) {
  const { data: part, loading, error, reload } = useFetch(() => partsApi.get(partId), [partId]);

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <DetailList
      items={[
        { label: 'Nombre', value: part.name },
        { label: 'Número de parte', value: part.part_number },
        { label: 'Categoría', value: orDash(part.category) },
        { label: 'Marca', value: orDash(part.brand) },
        { label: 'Precio', value: formatCurrency(part.price) },
        { label: 'Stock', value: <StockBadge stock={part.stock} /> },
        { label: 'Descripción', value: orDash(part.description) },
        { label: 'Fecha de registro', value: formatDate(part.created_at) },
      ]}
    />
  );
}
