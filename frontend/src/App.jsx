import { Link, Route, Routes } from 'react-router';
import Layout from './components/Layout.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import { EmptyState } from './components/StatusViews.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import UsersPage from './pages/users/UsersPage.jsx';
import CarsPage from './pages/cars/CarsPage.jsx';
import PartsPage from './pages/parts/PartsPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />

      {/* Todo el panel requiere sesión de administrador */}
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="usuarios" element={<UsersPage />} />
        <Route path="automoviles" element={<CarsPage />} />
        <Route path="piezas" element={<PartsPage />} />
        <Route
          path="*"
          element={
            <EmptyState
              title="Página no encontrada"
              text="La dirección que buscas no existe."
              action={
                <Link to="/" className="button">
                  Ir al dashboard
                </Link>
              }
            />
          }
        />
      </Route>
    </Routes>
  );
}
