import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, setUnauthorizedHandler } from '../api/client.js';
import { clearToken, getToken, saveToken } from './tokenStorage.js';

const AuthContext = createContext(null);

/**
 * Estado de la sesión del administrador.
 * El token vive en sessionStorage; aquí solo se refleja si hay sesión o no.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken);
  // true cuando la sesión terminó por un 401 (para mostrar el aviso en el login)
  const [sessionExpired, setSessionExpired] = useState(false);

  const login = useCallback(async (password) => {
    const { token: newToken } = await authApi.login(password);
    saveToken(newToken);
    setSessionExpired(false);
    setToken(newToken);
  }, []);

  // Cerrar sesión = borrar el token del navegador (el token es stateless, ver README)
  const logout = useCallback(() => {
    clearToken();
    setToken(null);
  }, []);

  // Si la API responde 401, se cierra la sesión y RequireAuth redirige al login
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setSessionExpired(true);
      setToken(null);
    });
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated: Boolean(token), sessionExpired, login, logout }),
    [token, sessionExpired, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
