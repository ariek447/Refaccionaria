const currencyFormatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const dateFormatter = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' });

export const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);
export const formatDate = (value) => (value ? dateFormatter.format(new Date(value)) : '—');
export const fullName = (person) => (person ? `${person.first_name} ${person.last_name}` : '—');
export const orDash = (value) => (value === null || value === undefined || value === '' ? '—' : value);

/** Búsqueda simple: ¿alguno de los valores contiene el texto? (sin distinguir acentos/mayúsculas) */
const normalize = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export const matchesSearch = (values, search) =>
  !search.trim() || values.some((value) => normalize(value).includes(normalize(search.trim())));

// Debe coincidir con LOW_STOCK_THRESHOLD del backend (services/dashboard.service.js)
export const LOW_STOCK_THRESHOLD = 5;
