# RideNow — Frontend (E2E 2 · CS2031 DBP)

Frontend en **React + TypeScript + Vite** que consume el backend del clon de Uber.
Cubre las 7 pantallas del rubric (20 pts) y todos los endpoints del backend.

## Requisitos

- Node.js 18+ y npm
- El backend corriendo en `http://localhost:8080` (`./mvnw spring-boot:run`)

## Levantar el frontend

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

> Si tu backend corre en otro puerto/host, cambia `API_BASE_URL` en
> `src/api/client.ts`.

## Cuentas de prueba

| Email | Password | Rol |
|-------|----------|-----|
| `ana@uber.com` | `pass123` | Pasajero |
| `carlos@uber.com` | `pass123` | Conductor |

En la pantalla de login hay botones que autocompletan estas cuentas.

## Estructura

```
src/
├── api/
│   ├── client.ts      # Axios + interceptores (token + 401) + extractError
│   ├── auth.ts        # /auth/register, /auth/login, /users/me
│   └── trips.ts       # /trips, /drivers/available, accept, complete, rate
├── context/
│   └── AuthContext.tsx # sesión: token en localStorage + perfil
├── components/
│   ├── ProtectedRoute.tsx  # guarda por sesión y rol
│   ├── Navbar.tsx
│   ├── StatusBadge.tsx
│   ├── StarRating.tsx
│   └── Spinner.tsx
├── pages/
│   ├── LoginPage.tsx          # (1) login/registro + selector de rol
│   ├── PassengerDashboard.tsx # (2) dashboard pasajero
│   ├── RequestTripPage.tsx    # (3) solicitar viaje + conductores disponibles
│   ├── TripDetailPage.tsx     # (4)+(6) detalle + polling + calificar/completar
│   ├── DriverDashboard.tsx    # (5) dashboard conductor
│   └── HistoryPage.tsx        # (7) historial con filtro
├── App.tsx            # rutas
├── main.tsx
├── types.ts           # tipos del contrato del backend
└── utils.ts           # formato de fechas, nombres, labels
```

## Cómo cumple el rubric

| # | Pantalla | Endpoints | Dónde |
|---|----------|-----------|-------|
| 1 | Login / Registro | `POST /auth/register` · `POST /auth/login` · `GET /users/me` | `LoginPage` + `AuthContext` |
| 2 | Dashboard pasajero | `GET /users/me` · `GET /trips` | `PassengerDashboard` |
| 3 | Solicitar viaje | `GET /drivers/available` · `POST /trips` | `RequestTripPage` |
| 4 | Detalle viaje (pasajero) + calificación + polling | `GET /trips/{id}` · `POST /trips/{id}/rate` | `TripDetailPage` |
| 5 | Dashboard conductor | `GET /users/me` · `GET /trips/pending` · `GET /trips/my` · `PATCH /trips/{id}/accept` | `DriverDashboard` |
| 6 | Detalle viaje (conductor) + completar | `GET /trips/{id}` · `PATCH /trips/{id}/complete` | `TripDetailPage` |
| 7 | Historial con filtro (ambos roles) | `GET /trips` · `GET /trips/my` | `HistoryPage` |

## Decisiones de implementación

- **Token en `localStorage`** e inyectado en cada request por un interceptor de Axios.
  Ante un `401`, se limpia la sesión y se redirige a `/login`.
- **Rutas protegidas por rol**: un pasajero no entra al panel del conductor y viceversa.
  Tras login, cada rol es redirigido a su home.
- **Polling** en el detalle del viaje: se refresca cada 4 s mientras el estado sea
  `PENDING` o `IN_PROGRESS`, y se detiene al llegar a `COMPLETED`.
- **Errores**: `extractError()` normaliza tanto `{ error: "..." }` como los errores de
  validación por campo a un mensaje legible.
- **Campos nulables** (`driver`, `acceptedAt`, `passengerRating`, etc.) se manejan con
  optional chaining y comprobaciones explícitas.

## Prueba del flujo completo

1. Login como `ana@uber.com` (pasajero) → Pedir viaje → se crea en `PENDING` y entras al detalle (verás "buscando conductor…").
2. En otra pestaña, login como `carlos@uber.com` (conductor) → Panel → Aceptar ese viaje.
3. La pestaña del pasajero se actualiza sola (polling) y muestra al conductor.
4. Conductor → "Completar viaje".
5. Pasajero → aparece el formulario de calificación (1–5 ★). Al enviar, el rating del conductor se actualiza.
