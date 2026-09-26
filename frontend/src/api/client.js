import { clearToken, getToken } from '../auth/tokenStorage.js';

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

// Función que se ejecuta cuando la API responde 401 (la registra AuthContext)
let onUnauthorized = () => {};
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
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

  // Token ausente, inválido o expirado: se cierra la sesión y la app redirige al login.
  // (En /login un 401 solo significa "contraseña incorrecta".)
  if (response.status === 401 && path !== '/login') {
    clearToken();
    onUnauthorized();
  }

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

export const authApi = { login: (password) => request('/login', { method: 'POST', body: { password } }) };
export const usersApi = createResourceApi('users');
export const carsApi = createResourceApi('cars');
export const partsApi = createResourceApi('parts');
export const dashboardApi = { get: () => request('/dashboard') };
