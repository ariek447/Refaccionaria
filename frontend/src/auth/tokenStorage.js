// El token se guarda en sessionStorage: se borra al cerrar la pestaña.
// try/catch porque algunos navegadores bloquean el almacenamiento (modo privado estricto).
const TOKEN_KEY = 'refaccionaria.token';

export function getToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveToken(token) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Sin almacenamiento la sesión solo dura mientras la página esté abierta
  }
}

export function clearToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nada que borrar
  }
}
