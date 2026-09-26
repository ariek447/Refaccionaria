// URL base de la API. En producción viene de VITE_API_URL; en desarrollo
// se usa "/api" y el proxy de Vite la redirige al backend local.
const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

/** Error de la API con el código HTTP y los errores por campo (si los hay). */
export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor.', 0);
  }

  // Si no llega JSON, casi siempre es porque VITE_API_URL no apunta al backend
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new ApiError('La API no respondió correctamente. Verifica que el backend esté activo y la variable VITE_API_URL.', response.status);
  }

  const data = await response.json();
  if (!response.ok) {
    throw new ApiError(data?.error || 'Ocurrió un error inesperado.', response.status, data?.details);
  }
  return data;
}

/** Crea las funciones CRUD para un recurso REST (users, cars, parts). */
function createResourceApi(resource) {
  return {
    list: () => request(`/${resource}`),
    get: (id) => request(`/${resource}/${id}`),
    create: (data) => request(`/${resource}`, { method: 'POST', body: data }),
    update: (id, data) => request(`/${resource}/${id}`, { method: 'PUT', body: data }),
    remove: (id) => request(`/${resource}/${id}`, { method: 'DELETE' }),
  };
}

export const usersApi = createResourceApi('users');
export const carsApi = createResourceApi('cars');
export const partsApi = createResourceApi('parts');
export const dashboardApi = { get: () => request('/dashboard') };
