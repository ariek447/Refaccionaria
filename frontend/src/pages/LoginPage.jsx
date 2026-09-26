import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext.jsx';
import Icon from '../components/Icons.jsx';

export default function LoginPage() {
  const { isAuthenticated, sessionExpired, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Página a la que se quería entrar antes de ser redirigido al login
  const from = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : '/';

  if (isAuthenticated) return <Navigate to={from} replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!password) {
      setError('Escribe la contraseña.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await login(password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
      setPassword('');
      setSubmitting(false);
    }
  };

  return (
    <main className="login">
      <form className="login__card" onSubmit={handleSubmit} noValidate>
        <div className="login__brand">
          <Icon name="part" size={28} />
          <span>Refaccionaria</span>
        </div>
        <h1>Acceso de administrador</h1>
        <p className="muted">Ingresa la contraseña para administrar el sistema.</p>

        {sessionExpired && !error && (
          <p className="login__notice">Tu sesión expiró. Inicia sesión de nuevo.</p>
        )}

        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            autoFocus
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'password-error' : undefined}
          />
          {error && (
            <small id="password-error" className="field__error" role="alert">
              {error}
            </small>
          )}
        </div>

        <button type="submit" className="button login__submit" disabled={submitting}>
          <Icon name="lock" /> {submitting ? 'Verificando…' : 'Iniciar sesión'}
        </button>
      </form>
    </main>
  );
}
