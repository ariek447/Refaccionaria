# Refaccionaria — Sistema de administración

Aplicación web para una refaccionaria que permite administrar **usuarios (clientes)**, sus **automóviles** y el inventario de **piezas/refacciones**, con CRUD completo y un dashboard de resumen.

> **Nota:** la tabla `users` representa a los **clientes** de la refaccionaria, no a usuarios con inicio de sesión. El sistema no implementa autenticación.

---

## Índice

1. [Tecnologías](#tecnologías)
2. [Arquitectura](#arquitectura)
3. [Estructura de carpetas](#estructura-de-carpetas)
4. [Base de datos](#base-de-datos)
5. [Configuración de Supabase](#configuración-de-supabase)
6. [Variables de entorno](#variables-de-entorno)
7. [Instalación y ejecución local](#instalación-y-ejecución-local)
8. [API REST (endpoints)](#api-rest)
9. [Ejemplos de requests](#ejemplos-de-requests)
10. [Deployment en Render](#deployment-en-render)
11. [Seguridad](#seguridad)

---

## Tecnologías

| Capa          | Tecnología                                              |
| ------------- | ------------------------------------------------------- |
| Frontend      | React 19, Vite, React Router, CSS propio (JavaScript)   |
| Backend       | Node.js, Express 5, API REST, `helmet`, `cors`, `dotenv` |
| Base de datos | Supabase (PostgreSQL) con `@supabase/supabase-js`       |
| Deployment    | Render (Web Service + Static Site)                      |

---

## Arquitectura

```
┌──────────────────┐   HTTP/JSON    ┌────────────────────┐  supabase-js   ┌──────────────────┐
│  Frontend React  │ ─────────────► │  Backend Express   │ ─────────────► │     Supabase     │
│  (Static Site)   │  /api/...      │  (Web Service)     │                │   (PostgreSQL)   │
└──────────────────┘ ◄───────────── └────────────────────┘ ◄───────────── └──────────────────┘
   Sin credenciales                   Tiene las credenciales
                                      en variables de entorno
```

- El **frontend nunca se conecta a la base de datos**: todas las operaciones pasan por el backend.
- Las credenciales de Supabase solo existen en el servidor (variables de entorno).

**Flujo de una petición en el backend:**

```
routes  →  middleware (validación)  →  controller  →  service  →  Supabase
                                                          │
                     errorHandler (respuesta de error) ◄──┘ (si algo falla)
```

| Capa             | Responsabilidad                                                              |
| ---------------- | ---------------------------------------------------------------------------- |
| `routes/`        | Define los endpoints y qué middlewares/controladores se ejecutan.            |
| `middleware/`    | Validación/sanitización del body y del `:id`; manejo centralizado de errores. |
| `validators/`    | Reglas de validación de cada recurso (declarativas).                         |
| `controllers/`   | Reciben la petición HTTP y devuelven la respuesta con el código correcto.    |
| `services/`      | Consultas a Supabase. Traducen errores de PostgreSQL a errores HTTP.         |
| `config/`        | Variables de entorno, cliente de Supabase y configuración de CORS.           |

Para no repetir el mismo código tres veces, el CRUD está implementado una sola vez
(`createCrudService`, `createCrudController`, `createCrudRouter`) y cada recurso solo
define su configuración (tabla, relaciones y mensajes).

**Frontend:** cada sección (Usuarios, Automóviles, Piezas) tiene una página con tabla,
búsqueda, y modales para crear/editar, ver detalle y confirmar la eliminación.
El hook `useCrud` concentra la lógica de carga, guardado, eliminación y notificaciones.

---

## Estructura de carpetas

```
.
├── backend/
│   ├── src/
│   │   ├── config/          # env.js, supabase.js, cors.js
│   │   ├── controllers/     # crudController.js + un archivo por recurso + dashboard
│   │   ├── middleware/      # validate.js, errorHandler.js
│   │   ├── routes/          # index.js (monta todo), crudRoutes.js
│   │   ├── services/        # crudService.js + users/cars/parts/dashboard
│   │   ├── utils/           # httpError.js, dbErrors.js
│   │   ├── validators/      # schemas.js (reglas de validación)
│   │   └── server.js        # punto de entrada
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── api/client.js    # llamadas a la API (fetch)
│   │   ├── components/      # Layout, Modal, DataTable, Toast, Form, ...
│   │   ├── hooks/           # useCrud, useForm, useFetch
│   │   ├── pages/           # Dashboard, users/, cars/, parts/
│   │   ├── utils/           # validators.js, format.js
│   │   ├── App.jsx          # rutas
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── database/
│   ├── schema.sql           # esquema para ejecutar en Supabase
│   └── seed.sql             # datos de ejemplo (opcional)
├── render.yaml              # Blueprint de Render (opcional)
├── .gitignore
└── README.md
```

---

## Base de datos

Relación principal: **users 1 ──── N cars** (un cliente puede tener varios automóviles).

```
users                          cars                             parts
─────────────────────          ─────────────────────────        ──────────────────────
id          PK                 id             PK                id           PK
first_name  NOT NULL           user_id        FK → users.id     name         NOT NULL
last_name   NOT NULL           brand          NOT NULL          description
phone       NOT NULL           model          NOT NULL          category
email       UNIQUE             year           NOT NULL, CHECK   brand
address                        color                            part_number  NOT NULL, UNIQUE
created_at                     license_plate  NOT NULL, UNIQUE  price        CHECK (>= 0)
                               vin            NOT NULL, UNIQUE  stock        CHECK (>= 0)
                               created_at                       created_at
```

Decisiones:

- **IDs** `bigint generated always as identity` (autoincremento de PostgreSQL): más fáciles de leer que UUIDs durante una demostración.
- **`ON DELETE RESTRICT`** en `cars.user_id`: no se puede eliminar un cliente que tenga automóviles; la API responde `409` con un mensaje claro. Así nunca quedan autos sin propietario.
- **UNIQUE** en `users.email`, `cars.vin`, `cars.license_plate` y `parts.part_number`.
- **CHECK** en `price >= 0`, `stock >= 0`, año entre 1900 y 2100, formato de VIN y de email.
- **Row Level Security** habilitado sin políticas: solo el backend (con la service key) accede a los datos.

El script completo está en [`database/schema.sql`](database/schema.sql).

---

## Configuración de Supabase

1. Entra a <https://supabase.com> y crea un **nuevo proyecto** (guarda la contraseña de la base de datos).
2. En el panel del proyecto ve a **SQL Editor → New query**.
3. Copia el contenido de `database/schema.sql`, pégalo y presiona **Run**.
4. (Opcional) Ejecuta también `database/seed.sql` para cargar datos de ejemplo.
5. Ve a **Project Settings → API** (o **Data API / API Keys**) y copia:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (en proyectos nuevos: **secret key**) → `SUPABASE_SERVICE_KEY`
     ⚠️ Esta llave es secreta: solo va en el backend, nunca en el frontend ni en Git.
6. Verifica en **Table Editor** que existan las tablas `users`, `cars` y `parts`.

---

## Variables de entorno

### Backend (`backend/.env`)

| Variable            | Descripción                                                                                  | Ejemplo                                   |
| ------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `PORT`              | Puerto local. En Render se asigna automáticamente.                                           | `4000`                                    |
| `NODE_ENV`          | `development` o `production`.                                                                | `development`                             |
| `SUPABASE_URL`      | URL del proyecto de Supabase. **Obligatoria.**                                               | `https://abcd.supabase.co`                |
| `SUPABASE_SERVICE_KEY` | Llave service_role / secret del proyecto. **Obligatoria y secreta.**                     | `eyJhbGciOi...`                           |
| `FRONTEND_URL`      | Dominio(s) del frontend permitidos por CORS, separados por coma, sin `/` final.              | `https://refaccionaria-web.onrender.com`  |

Si falta `SUPABASE_URL` o `SUPABASE_SERVICE_KEY`, el servidor no arranca y muestra qué variable falta.

### Frontend (`frontend/.env`)

| Variable       | Descripción                                                                                   | Ejemplo                                        |
| -------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `VITE_API_URL` | URL pública del backend **incluyendo `/api`**. En desarrollo puede quedar vacía (usa el proxy de Vite). | `https://refaccionaria-api.onrender.com/api` |

> Las variables `VITE_*` se incrustan en el JavaScript durante el build: **nunca** pongas secretos ahí.
> `.env` está en `.gitignore`; solo se suben los archivos `.env.example`.

---

## Instalación y ejecución local

Requisitos: **Node.js 22.22 o superior** y un proyecto de Supabase con el esquema ejecutado.

### Backend

```bash
cd backend
cp .env.example .env      # en Windows (PowerShell): Copy-Item .env.example .env
# edita .env con tu SUPABASE_URL y SUPABASE_SERVICE_KEY
npm install
npm run dev               # http://localhost:4000  (se reinicia al guardar cambios)
```

Prueba: <http://localhost:4000/api/health> → `{"status":"ok"}`

### Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

En desarrollo no hace falta crear `frontend/.env`: Vite redirige automáticamente las
peticiones `/api/*` a `http://localhost:4000` (ver `vite.config.js`).

---

## API REST

URL base: `http://localhost:4000/api` (local) o `https://<tu-backend>.onrender.com/api` (producción).
Todas las peticiones y respuestas usan JSON.

| Método | Endpoint          | Descripción                                        | Respuesta OK |
| ------ | ----------------- | -------------------------------------------------- | ------------ |
| GET    | `/health`         | Estado del servicio                                | 200          |
| GET    | `/dashboard`      | Estadísticas para el dashboard                     | 200          |
| GET    | `/users`          | Listar usuarios                                    | 200          |
| GET    | `/users/:id`      | Consultar usuario **(incluye sus automóviles)**    | 200          |
| POST   | `/users`          | Crear usuario                                      | 201          |
| PUT    | `/users/:id`      | Editar usuario                                     | 200          |
| DELETE | `/users/:id`      | Eliminar usuario                                   | 200          |
| GET    | `/cars`           | Listar automóviles **(incluye propietario)**       | 200          |
| GET    | `/cars/:id`       | Consultar automóvil **(incluye propietario)**      | 200          |
| POST   | `/cars`           | Crear automóvil                                    | 201          |
| PUT    | `/cars/:id`       | Editar automóvil                                   | 200          |
| DELETE | `/cars/:id`       | Eliminar automóvil                                 | 200          |
| GET    | `/parts`          | Listar piezas                                      | 200          |
| GET    | `/parts/:id`      | Consultar pieza                                    | 200          |
| POST   | `/parts`          | Crear pieza                                        | 201          |
| PUT    | `/parts/:id`      | Editar pieza                                       | 200          |
| DELETE | `/parts/:id`      | Eliminar pieza                                     | 200          |

### Códigos de respuesta

| Código | Cuándo                                                                                     |
| ------ | ------------------------------------------------------------------------------------------ |
| 200    | Consulta, edición o eliminación correcta.                                                  |
| 201    | Registro creado.                                                                           |
| 400    | Datos inválidos, JSON mal formado, id no numérico o propietario inexistente.               |
| 404    | El registro o la ruta no existen.                                                          |
| 409    | Conflicto: dato duplicado (email, VIN, placas, número de parte) o usuario con automóviles. |
| 500    | Error interno (el detalle solo se registra en el servidor).                                |

Formato de error:

```json
{
  "error": "Los datos enviados no son válidos.",
  "details": { "phone": "El teléfono es obligatorio." }
}
```

### Reglas de validación

| Recurso | Reglas |
| ------- | ------ |
| Usuario | `first_name`, `last_name`, `phone` obligatorios; `phone` 7–20 dígitos; `email` con formato válido (opcional, único). |
| Automóvil | `user_id` (debe existir), `brand`, `model`, `year` (1900 – año actual + 1), `license_plate` y `vin` obligatorios; VIN de 17 caracteres sin I/O/Q; placas y VIN se guardan en mayúsculas. |
| Pieza | `name` y `part_number` obligatorios; `price >= 0`; `stock` entero `>= 0`. |

Además, el backend **ignora cualquier campo no definido** (por ejemplo `id` o `created_at`), recorta espacios y normaliza mayúsculas/minúsculas.

---

## Ejemplos de requests

Con `curl` (en PowerShell usa `curl.exe`). Reemplaza la URL base según el entorno.

```bash
API=http://localhost:4000/api
```

**Crear usuario**

```bash
curl -X POST $API/users \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Juan",
    "last_name": "Pérez",
    "phone": "6141234567",
    "email": "juan@example.com",
    "address": "Chihuahua, Chihuahua"
  }'
```

Respuesta `201`:

```json
{
  "id": 1,
  "first_name": "Juan",
  "last_name": "Pérez",
  "phone": "6141234567",
  "email": "juan@example.com",
  "address": "Chihuahua, Chihuahua",
  "created_at": "2026-09-26T17:36:49.827Z"
}
```

**Crear automóvil para el usuario 1**

```bash
curl -X POST $API/cars \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "brand": "Nissan",
    "model": "Versa",
    "year": 2019,
    "color": "Blanco",
    "license_plate": "EFG-123-A",
    "vin": "3N1CN7AD5KL800001"
  }'
```

Respuesta `201` (incluye el propietario):

```json
{
  "id": 1,
  "user_id": 1,
  "brand": "Nissan",
  "model": "Versa",
  "year": 2019,
  "color": "Blanco",
  "license_plate": "EFG-123-A",
  "vin": "3N1CN7AD5KL800001",
  "created_at": "2026-09-26T17:36:49.953Z",
  "owner": { "id": 1, "first_name": "Juan", "last_name": "Pérez", "phone": "6141234567", "email": "juan@example.com" }
}
```

**Consultar un usuario con sus automóviles**

```bash
curl $API/users/1
```

```json
{
  "id": 1,
  "first_name": "Juan",
  "last_name": "Pérez",
  "...": "...",
  "cars": [
    { "id": 1, "brand": "Nissan", "model": "Versa", "year": 2019, "color": "Blanco", "license_plate": "EFG-123-A", "vin": "3N1CN7AD5KL800001" }
  ]
}
```

**Crear pieza**

```bash
curl -X POST $API/parts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Filtro de aceite",
    "description": "Filtro para motor 1.6L",
    "category": "Filtros",
    "brand": "Bosch",
    "part_number": "BOS-0451103",
    "price": 149.5,
    "stock": 25
  }'
```

**Editar pieza** (PUT envía el registro completo)

```bash
curl -X PUT $API/parts/1 \
  -H "Content-Type: application/json" \
  -d '{ "name": "Filtro de aceite", "part_number": "BOS-0451103", "price": 159, "stock": 20 }'
```

**Eliminar un usuario que tiene automóviles** → `409`

```bash
curl -X DELETE $API/users/1
```

```json
{ "error": "No se puede eliminar el usuario porque tiene automóviles registrados." }
```

**Dashboard**

```bash
curl $API/dashboard
```

```json
{
  "totals": { "users": 3, "cars": 3, "parts": 5, "lowStockParts": 3 },
  "lowStockThreshold": 5,
  "inventoryValue": 16323.5,
  "lowStockParts": [{ "id": 5, "name": "Banda de distribución", "part_number": "GAT-TCK328", "brand": "Gates", "stock": 0 }],
  "recentCars": [{ "id": 3, "brand": "Chevrolet", "model": "Aveo", "year": 2018, "license_plate": "EFJ-789-C", "owner": { "id": 2, "first_name": "María", "last_name": "González" } }],
  "recentUsers": [{ "id": 3, "first_name": "Luis", "last_name": "Ramírez", "phone": "6149876543", "email": null }]
}
```

---

## Deployment en Render

Requisito previo: subir el proyecto a un repositorio de **GitHub** (o GitLab/Bitbucket).
Verifica que **no** se suban archivos `.env` (`git status` no debe mostrarlos).

### 1. Crear proyecto en Supabase

Ver [Configuración de Supabase](#configuración-de-supabase).

### 2. Ejecutar `database/schema.sql`

En **SQL Editor** de Supabase (y opcionalmente `seed.sql`).

### 3. Crear el Web Service del backend

En <https://dashboard.render.com>: **New → Web Service** → conecta el repositorio y configura:

| Campo          | Valor           |
| -------------- | --------------- |
| Name           | `refaccionaria-api` |
| Root Directory | `backend`       |
| Runtime        | Node            |
| Build Command  | `npm install`   |
| Start Command  | `npm start`     |
| Health Check Path (Advanced) | `/api/health` |

### 4. Configurar variables de entorno del backend

En la sección **Environment**:

| Variable            | Valor                                                     |
| ------------------- | --------------------------------------------------------- |
| `NODE_ENV`          | `production`                                              |
| `SUPABASE_URL`      | URL de tu proyecto de Supabase                            |
| `SUPABASE_SERVICE_KEY` | service_role / secret key de Supabase                  |
| `FRONTEND_URL`      | Déjala pendiente por ahora; se completa en el paso 9      |

No configures `PORT`: Render la asigna y el servidor usa `process.env.PORT`.

### 5. Deploy del backend

Presiona **Create Web Service** y espera a que el estado sea **Live**.

### 6. Obtener la URL del backend

Render la muestra arriba, por ejemplo `https://refaccionaria-api.onrender.com`.
Compruébala en el navegador: `https://refaccionaria-api.onrender.com/api/health` → `{"status":"ok"}`.

### 7. Configurar el frontend con la URL de la API

**New → Static Site** → mismo repositorio:

| Campo             | Valor                               |
| ----------------- | ----------------------------------- |
| Name              | `refaccionaria-web`                 |
| Root Directory    | `frontend`                          |
| Build Command     | `npm install && npm run build`      |
| Publish Directory | `dist`                              |

Variable de entorno:

| Variable       | Valor                                              |
| -------------- | -------------------------------------------------- |
| `VITE_API_URL` | `https://refaccionaria-api.onrender.com/api`       |

Y en **Redirects/Rewrites** agrega una regla (necesaria para que funcionen rutas como `/usuarios` al recargar la página):

| Source | Destination   | Action  |
| ------ | ------------- | ------- |
| `/*`   | `/index.html` | Rewrite |

### 8. Deploy del frontend

Presiona **Create Static Site**. Render mostrará su URL, por ejemplo `https://refaccionaria-web.onrender.com`.

> Si cambias `VITE_API_URL` después, haz **Manual Deploy → Clear build cache & deploy**, porque el valor se incrusta durante el build.

### 9. Configurar CORS

Regresa al Web Service del backend → **Environment** → define
`FRONTEND_URL=https://refaccionaria-web.onrender.com` (sin `/` al final) y guarda.
Render reiniciará el backend automáticamente.

### 10. Probar la aplicación publicada

1. Abre la URL del frontend.
2. Crea un usuario, luego un automóvil asignado a ese usuario y una pieza.
3. Edita y elimina registros; revisa que el dashboard se actualice.
4. Intenta eliminar un usuario con automóviles: debe mostrarse el aviso de que no es posible.

> En el plan gratuito, el backend se "duerme" tras 15 minutos sin uso; la primera petición puede tardar ~1 minuto. Abre `/api/health` unos minutos antes de la presentación.

### Alternativa: Blueprint (`render.yaml`)

El repositorio incluye `render.yaml`. En Render: **New → Blueprint** → selecciona el repositorio;
creará ambos servicios y pedirá `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `FRONTEND_URL` y `VITE_API_URL`.

---

## Seguridad

- **Credenciales solo en el backend**, vía variables de entorno; `.env` excluido de Git.
- **El frontend no tiene acceso a la base de datos**: solo conoce la URL pública de la API.
- **CORS**: en producción solo se aceptan peticiones del dominio definido en `FRONTEND_URL`; en desarrollo se permite `localhost`.
- **Validación y sanitización** en el backend (y también en el frontend para mejor experiencia): lista blanca de campos, recorte de espacios, tipos, longitudes, formatos y rangos.
- **Restricciones en la base de datos** (NOT NULL, UNIQUE, CHECK, FK) como última línea de defensa.
- **Consultas parametrizadas**: `supabase-js` no concatena SQL, evitando inyección SQL. React escapa el contenido mostrado (evita XSS).
- **`helmet`** agrega cabeceras HTTP de seguridad y el body JSON está limitado a 10 KB.
- **Errores**: manejo centralizado; en producción los errores 500 no exponen detalles internos.
- **Service key solo en el servidor + RLS sin políticas**: el backend usa la llave `service_role`, que omite RLS.
  Las tablas tienen RLS activado y ninguna política, así que la anon key (que Supabase considera pública)
  no puede leer ni modificar datos: la única puerta a la base de datos es la API, con sus validaciones.
