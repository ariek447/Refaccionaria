import { NavLink, Outlet } from 'react-router';
import Icon from './Icons.jsx';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/usuarios', label: 'Usuarios', icon: 'users' },
  { to: '/automoviles', label: 'Automóviles', icon: 'car' },
  { to: '/piezas', label: 'Piezas', icon: 'part' },
];

export default function Layout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <Icon name="part" size={22} />
          <span>Refaccionaria</span>
        </div>
        <nav className="sidebar__nav" aria-label="Navegación principal">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className="sidebar__link">
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
