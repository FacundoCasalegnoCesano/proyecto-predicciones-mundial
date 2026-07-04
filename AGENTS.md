# Mundial 2026 - State

## Stack
- **Backend:** Express 5 + TypeScript 6 + Prisma 6 + Zod 4 + MySQL (Docker :3307) + Redis (Docker :6379)
- **Frontend:** Vue 3 + TypeScript + Pinia + Vue Router 5 + Tailwind CSS 4 + flag-icons
- **Auth:** JWT (jsonwebtoken, 7d expiry) + bcrypt
- **Real-time:** Socket.IO (server + client)
- **Email:** Nodemailer (Gmail SMTP)
- **Server:** `npx tsx src/server.ts` (puerto 3000)
- **Client:** `npm run dev` (puerto 5173, Vite proxy /api + /socket.io → :3000)
- **Login test:** facu@test.com / 123456 (rol ADMIN)

## Prisma Models (`server/prisma/schema.prisma`)
- **User** — id, username (unique), email (unique), password (bcrypt), firstName?, lastName?, role (USER/ADMIN), pointsEarned (int, default 0), createdAt, updatedAt
- **Team** — id, apiId (unique), name, code? (flag-icon CSS), flag?, groupName? (A-L)
- **Match** — id, apiId (unique), phase, round?, date, status (scheduled/FT/live/HT/PEN), homeTeamId? (nullable for TBD), awayTeamId? (nullable for TBD), homeScore?, awayScore?
- **Prediction** — id, userId + matchId (unique compound), predictedHomeScore, predictedAwayScore, points (default 0), createdAt, updatedAt

## DB seed (`server/prisma/seed-2026.ts`)
Ejecutar con `npx tsx prisma/seed-2026.ts`
- 48 equipos en 12 grupos de 4 (A-L)
- 72 partidos de grupos (todos FT, resultados reales)
- 16 partidos de 32avos (10 FT, 6 scheduled)
- 8 partidos de octavos (4 con equipos, 4 TBD con null teams)
- 4 cuartos, 2 semis, 1 tercer puesto, 1 final (todos TBD, null teams)

## API Endpoints

### Auth (`/api/auth`)
- `POST /register` — crear cuenta (username, email, password, firstName?, lastName?)
- `POST /login` — login (email, password) → JWT + user
- `GET /me` — perfil actual (auth)
- `PATCH /profile` — editar perfil (auth)
- `PATCH /password` — cambiar contraseña (auth)
- `DELETE /account` — eliminar cuenta (auth)
- `POST /forgot-password` — email con link de reseteo (JWT 1h, nodemailer)
- `POST /reset-password` — resetear contraseña con token

### Matches (`/api/matches`)
- `GET /?phase=group` — listar partidos, filtro por fase (auth no requerido)
- `POST /` — crear partido (admin)
- `PATCH /:id` — editar score/equipos/status (admin)

### Teams (`/api/teams`)
- `GET /` — listar todos los equipos (auth no requerido)

### Predictions (`/api/predictions`)
- `POST /` — crear/actualizar predicción (auth, solo scheduled con ambos equipos)
- `GET /mine` — mis predicciones (auth)
- `POST /calculate` — recalcular puntos de todos (admin)
- `GET /ranking` — ranking de usuarios por pointsEarned (auth no requerido)
- `GET /user/:userId` — predicciones de un usuario (auth)
- `GET /admin/all` — todas las predicciones con filtros (admin)

### Admin (`/api/admin`)
- `GET /users?search=` — listar usuarios con búsqueda (admin)
- `PATCH /users/:userId/role` — cambiar rol USER/ADMIN (admin)

## Frontend Routes

| Ruta | Vista | Auth |
|------|-------|------|
| `/` | redirect → `/dashboard` | - |
| `/login` | LoginView | No |
| `/register` | RegisterView | No |
| `/forgot-password` | ForgotPasswordView | No |
| `/reset-password` | ResetPasswordView | No |
| `/dashboard` | DashboardView (botones Partidos / Mis Pronosticos / Posiciones) | Sí |
| `/profile` | ProfileView (editar perfil + cambiar contraseña) | Sí |
| `/matches` | MatchesView (partidos por fase + inputs para scheduled) | Sí |
| `/predictions` | PredictionsView (mis predicciones editables) | Sí |
| `/standings` | RankingView (ranking usuarios) | No |
| `/admin` | AdminView (usuarios: buscar, cambiar rol) | Admin |
| `/admin/matches` | AdminMatchesView (editar scores, asignar TBD, crear) | Admin |
| `/admin/predictions` | AdminPredictionsView (todas las predicciones + recalcular) | Admin |
| `/user/:userId/predictions` | UserPredictionsView (ver predicciones de otro usuario) | Sí |

## Nav (App.vue)
- Todos: "Posiciones" (`/standings`)
- Logged in: Dashboard, Partidos, Perfil, Salir
- Admin: Admin (links a users, matches, predictions)
- Logged out: Iniciar sesión, Registrarse

## Socket.IO
- **Server:** `server/src/config/socket.ts` — HTTP + Socket.IO con CORS \*, expone `getIO()`
- **Client:** `client/src/services/socket.ts` — conexión a `VITE_WS_URL` o `http://localhost:3000`
- **Eventos:** `prediction_updated` (al guardar predicción), `ranking_update` (al recalcular)
- **Listeners:** RankingView, MatchesView, PredictionsView; fallback con polling 30s + visibilitychange
- **App.vue:** connect/disconnect global

## Scoring System (`predictions.service.ts`)
- 6 pts: resultado exacto (mismo score)
- 3 pts: mismo ganador/empate (mismo signo de diferencia)
- 0 pts: incorrecto
- `pointsEarned` en User se actualiza atómicamente al recalcular (admin)

## Infrastructure
- `docker-compose.yml` — mysql:8 (:3307) + redis:7 (:6379)
- `server/railway.json` — Nixpacks builder, `npx tsx src/server.ts` como start command
- `.env` — DATABASE_URL (Railway MySQL), REDIS_URL, JWT_SECRET, SMTP creds, FRONTEND_URL
- `src/config/prisma.ts` — PrismaClient singleton
- `src/config/redis.ts` — ioredis client
- `src/middlewares/auth.ts` — authenticate (JWT) + requireAdmin

## Skills (globales en `~/.config/opencode/skills/`)
- **obra/superpowers** — plugin global en `opencode.json`
- 28 skills globales: brainstorming, test-driven-development, writing-plans, subagent-driven-development, systematic-debugging, skill-creator, web-design-guidelines, frontend-design, deploy-to-vercel, etc.

## Notifications (backend completo)
- Modelo `Notification` (id, userId, type, message, data?, read, createdAt)
- `GET /api/notifications`, `PATCH /:id/read`, `PATCH /read-all` (auth)
- Socket.IO event `notification` emitido al crear cada una
- Integrado en: auth (login/register/profile/password), predictions (save/recalculate), matches (create/update), admin (role change)
- **Frontend pendiente** — hacer en `dev/frontend`

## Próximos pasos
- Tests (unitarios/integración backend + frontend)
- Mejorar seed (incremental, actualizable sin reiniciar)
- Deploy frontend a Vercel (set VITE_WS_URL al Railway backend)
- Toasts UI (frontend, usa el backend de notifications)
- Responsive/mobile
- Swagger docs configurado en `/api/docs`

## Notas
- `matches.validation.ts` tiene `updateMatchSchema` con Zod pero el controller no lo usa (pasa raw body)
- Solo partidos `scheduled` con ambos equipos conocidos permiten predicciones
- Client usa `fetch()` nativo, no axios (aunque está en dependencias)
- No hay refresh token — JWT único de 7 días
- No se puede crear partidos de fase de grupos vía API (solo knockout)
