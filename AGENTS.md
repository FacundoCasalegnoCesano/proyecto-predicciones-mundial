# Mundial 2026 - State

## Stack
- **Backend:** Express + TypeScript + Prisma 6 + MySQL (Docker :3307) + Redis (Docker :6379)
- **Frontend:** Vue 3 + TypeScript + Pinia + Vue Router + Tailwind CSS 4 + flag-icons
- **Auth:** JWT (bcrypt)
- **Server:** `cd server && npx tsx src/server.ts` (puerto 3000)
- **Client:** `cd client && npm run dev` (puerto 5173, Vite proxy /api → :3000)
- **Login test:** facu@test.com / 123456 (rol ADMIN)

## DB seed
`server/prisma/seed-2026.ts` — ejecutar con `npx tsx prisma/seed-2026.ts`
- 48 equipos en 12 grupos de 4 (A-L)
- 72 partidos de grupos (todos FT, resultados reales)
- 16 partidos de 32avos (10 FT, 6 scheduled)
- 8 partidos de octavos (4 con equipos, 4 TBD)
- 4 cuartos, 2 semis, 1 tercer puesto, 1 final (todos TBD, null teams)

## Rutas frontend
| Ruta | Vista |
|------|-------|
| `/login` | Login |
| `/register` | Register |
| `/dashboard` | Dashboard (botones Partidos / Posiciones) |
| `/matches` | Partidos por fase + predicciones (inputs para scheduled) |
| `/standings` | Ranking de usuarios por puntos de predicciones |
| `/profile` | Editar perfil + cambiar contraseña |
| `/admin` | Admin usuarios (buscar, cambiar rol) |
| `/admin/matches` | Admin partidos (editar scores, asignar equipos a TBD, crear partidos) |

## Módulo de Predicciones
- `POST /api/predictions` — crear/actualizar predicción (autenticado)
- `GET /api/predictions/mine` — mis predicciones (autenticado)
- `POST /api/predictions/calculate` — recalcular puntos de todas las predicciones (admin)
- `GET /api/predictions/ranking` — ranking de usuarios por puntos

### Sistema de puntuación
- 6 pts: resultado exacto
- 3 pts: mismo ganador/empate
- 0 pts: incorrecto

El campo `pointsEarned` en User se actualiza automáticamente al recalcular.

## Próximos pasos
- Agregar WebSocket para ranking en tiempo real
- Mejorar seed con datos actualizables
- Tests

## Notas
- `server/src/modules/predictions/predictions.service.ts` tiene la lógica de cáculo
- Los partidos con equipos TBD tienen `homeTeamId: null` / `awayTeamId: null`
- flag-icons importado en `client/src/main.ts`
- Nav: link "Posiciones" visible para todos (logueados y no logueados)
