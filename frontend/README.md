# Frontend — Refaccionaria

Interfaz construida con **React + Vite** (JavaScript) y **React Router**. Consume la API REST del backend; nunca se conecta directamente a la base de datos.

## Ejecutar en local

Con el backend corriendo en `http://localhost:4000`:

```bash
npm install
npm run dev        # http://localhost:5173
```

En desarrollo, Vite redirige `/api/*` al backend local (ver `vite.config.js`), así que no se necesita `.env`.

## Build de producción

```bash
VITE_API_URL=https://tu-backend.onrender.com/api npm run build   # genera dist/
npm run preview                                                 # sirve dist/ localmente
```

| Variable       | Descripción                                                     |
| -------------- | --------------------------------------------------------------- |
| `VITE_API_URL` | URL pública del backend **incluyendo `/api`**, sin `/` al final |

## Páginas

| Ruta           | Página                                                                 |
| -------------- | ---------------------------------------------------------------------- |
| `/login`       | Inicio de sesión del administrador (única ruta pública)                |
| `/`            | Dashboard: totales, valor de inventario, stock bajo, registros recientes |
| `/usuarios`    | CRUD de usuarios; el detalle muestra sus automóviles                   |
| `/automoviles` | CRUD de automóviles con selector de propietario; filtro `?propietario=ID` |
| `/piezas`      | CRUD de piezas; filtro de stock bajo `?stock=bajo`                     |

## Estructura

```
src/
├── api/client.js          # fetch a la API + header Authorization + manejo de 401
├── auth/
│   ├── AuthContext.jsx    # estado de sesión: login(), logout(), isAuthenticated
│   └── tokenStorage.js    # guarda el token en sessionStorage
├── components/            # Layout, RequireAuth, Modal, ConfirmDialog, DataTable, Toast, Form, ...
├── hooks/
│   ├── useCrud.js         # listado + crear/editar/eliminar + notificaciones
│   ├── useForm.js         # estado y validación de formularios
│   └── useFetch.js        # petición simple con estados loading/error
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── users/             # UsersPage, UserForm, UserDetails
│   ├── cars/              # CarsPage, CarForm, CarDetails
│   └── parts/             # PartsPage, PartForm, PartDetails, StockBadge
├── utils/
│   ├── validators.js      # validaciones del lado del cliente
│   └── format.js          # moneda, fechas, búsqueda
├── App.jsx                # rutas
├── main.jsx               # punto de entrada
└── styles.css             # estilos globales y responsive
```

Formularios en **modales** (`<dialog>` nativo). La interfaz es responsive: menú lateral en escritorio,
barra superior en tablet/móvil, y las tablas se convierten en tarjetas en pantallas angostas.

## Sesión

- Todas las rutas excepto `/login` están envueltas en `RequireAuth`: sin token redirige a `/login`
  y, tras iniciar sesión, regresa a la página que se había solicitado.
- El token se guarda en `sessionStorage` (se borra al cerrar la pestaña) y `api/client.js` lo envía en
  cada petición como `Authorization: Bearer <token>`.
- Si la API responde `401`, se borra el token y se muestra el login con el aviso "Tu sesión expiró".
- "Cerrar sesión" (barra lateral) borra el token del navegador.
