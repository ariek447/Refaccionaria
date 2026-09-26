# Backend — API REST de la Refaccionaria

API construida con **Node.js + Express 5** que se conecta a **Supabase (PostgreSQL)** mediante `@supabase/supabase-js`.

## Ejecutar en local

```bash
cp .env.example .env    # completa SUPABASE_URL, SUPABASE_SERVICE_KEY, ADMIN_PASSWORD y AUTH_SECRET
npm install
npm run dev             # modo desarrollo (node --watch), puerto 4000
npm start               # modo producción
```

Verificación: `GET http://localhost:4000/api/health` → `{"status":"ok"}`

## Variables de entorno

| Variable            | Obligatoria | Descripción                                                   |
| ------------------- | ----------- | ------------------------------------------------------------- |
| `SUPABASE_URL`      | Sí          | URL del proyecto de Supabase                                  |
| `SUPABASE_SERVICE_KEY` | Sí       | service_role / secret key de Supabase (secreta)               |
| `ADMIN_PASSWORD`    | Sí          | Contraseña del panel (mín. 12 caracteres en producción)       |
| `AUTH_SECRET`       | Sí          | Llave para firmar tokens (mín. 32 caracteres en producción)   |
| `FRONTEND_URL`      | En producción | Dominio(s) permitidos por CORS, separados por coma          |
| `NODE_ENV`          | No          | `development` (por defecto) o `production`                    |
| `PORT`              | No          | Puerto (por defecto 4000; Render lo asigna solo)              |

## Estructura

```
src/
├── server.js                  # crea la app Express y la pone a escuchar en PORT
├── config/
│   ├── env.js                 # lee y valida variables de entorno
│   ├── supabase.js            # cliente de Supabase
│   └── cors.js                # orígenes permitidos
├── routes/
│   ├── index.js               # /health y /login públicas; el resto protegido con requireAuth
│   └── crudRoutes.js          # GET, GET/:id, POST, PUT/:id, DELETE/:id
├── middleware/
│   ├── auth.js                # requireAuth: exige "Authorization: Bearer <token>"
│   ├── loginRateLimit.js      # 5 intentos fallidos por IP cada 15 min
│   ├── validate.js            # validateBody(schema), validateIdParam
│   └── errorHandler.js        # 404 de rutas y manejador central de errores
├── validators/schemas.js      # reglas de validación de users, cars y parts
├── controllers/               # capa HTTP (códigos 200/201 y JSON)
├── services/                  # consultas a Supabase
└── utils/
    ├── httpError.js           # error con código HTTP
    ├── dbErrors.js            # traduce errores de PostgreSQL (23505, 23503...) a HTTP
    └── token.js               # crea/verifica tokens HMAC-SHA256 (24 h)
```

## Endpoints

Ver la tabla completa y ejemplos en el [README principal](../README.md#api-rest).

```
GET    /api/health                 (público)
POST   /api/login                  (público)  { "password" } → { token, expiresAt }
GET    /api/dashboard
GET    /api/users        GET /api/users/:id     POST /api/users     PUT /api/users/:id     DELETE /api/users/:id
GET    /api/cars         GET /api/cars/:id      POST /api/cars      PUT /api/cars/:id      DELETE /api/cars/:id
GET    /api/parts        GET /api/parts/:id     POST /api/parts     PUT /api/parts/:id     DELETE /api/parts/:id
```

## Manejo de errores

| Situación                                             | Código |
| ----------------------------------------------------- | ------ |
| Body inválido / JSON mal formado / id no numérico     | 400    |
| Sin token, token inválido/expirado, contraseña mala   | 401    |
| Más de 5 logins fallidos en 15 min (misma IP)         | 429    |
| Propietario (`user_id`) inexistente al crear un auto  | 400    |
| Registro o ruta no encontrados                        | 404    |
| Valor duplicado (email, VIN, placas, número de parte) | 409    |
| Eliminar usuario que tiene automóviles                | 409    |
| Error inesperado                                      | 500    |
