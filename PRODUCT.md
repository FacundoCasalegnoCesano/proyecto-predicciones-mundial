# Product

## Register

product

## Users

- **Jugadores casuales**: fans del fútbol que quieren participar en un prode del Mundial 2026 con amigos/compañeros
- **Admins**: organizadores del prode que gestionan partidos, scores, roles y recalculan puntos
- **Contexto**: usan la app durante el torneo (junio-julio 2026), en móvil y desktop, para ver fixture, pronosticar y seguir ranking

## Product Purpose

Plataforma de predicciones para el Mundial 2026. Permite a usuarios registrarse, ver el fixture por fases (grupos → 32avos → octavos → cuartos → semis → final), hacer pronósticos en partidos *scheduled* con ambos equipos definidos, y competir en un ranking por puntos (6 exacto / 3 ganador / 0 error). Admin gestiona equipos, partidos, scores y usuarios. Tiempo real vía Socket.IO para actualizaciones instantáneas de ranking y predicciones.

## Brand Personality

- **Competitiva**: sensación de torneo real, tensión deportiva
- **Confiable**: scores y rankings precisos, sin lag perceptible
- **Directa**: sin ruido visual, foco en la acción (pronosticar, ver resultados)

## Anti-references

- Prodes genéricos con tablas infinitas y sin jerarquía visual
- Dashboards "SaaS" con cards métricas repetidas (hero-metric template)
- Gradientes purple-blue por defecto, glassmorphism decorativo
- Eyebrows (labels mayúsculas trackeadas) sobre cada sección
- Número de sección (01/02/03) como scaffolding por defecto
- Texto gris claro sobre fondos tintados (contraste bajo)

## Design Principles

1. **Partido primero**: la tarjeta de match es el átomo; todo gira alrededor (ver, pronosticar, resultado)
2. **Jerarquía de fases**: grupo → knockout visible y navegable, no lista plana
3. **Tiempo real sin fricción**: Socket.IO invisible, fallback polling silencioso
4. **Admin potente pero contenido**: CRUD matches/usuarios sin abandonar la misma UI
5. **Dark mode nativo**: navy/gold World Cup, no "tema oscuro" genérico

## Accessibility & Inclusion

- WCAG AA mínimo (contraste 4.5:1 en texto, 3:1 en large text)
- `prefers-reduced-motion` respetado en animaciones
- Navegación por teclado completa (nav, tabs, inputs, botones)
- Estados de foco visibles (focus-visible ring)
- Textos en español (AR), sin i18n por ahora