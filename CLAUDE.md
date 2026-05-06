# PSI P4 — songproject frontend (Vue 3)

## Contexto
Frontend Vue.js que consume la API REST de P3 (ya desplegada en Render).
Asignación: pareja 12, grupo 2321, año 2026.

## Stack fijado (NO CAMBIAR)
- Vue 3.3.4 + Vite + Composition API (`<script setup>`)
- vue-router 4
- Pinia (token en MEMORIA, no localStorage — ver "Notas críticas")
- Bootstrap 5.3.0 + @popperjs/core 2.11.8 para estilos
- Cypress para E2E, Vitest para unit
- ESLint + Prettier

## Backend ya desplegado (P3)
- Render: `https://p3-songproject-12-2321-2026-v1.onrender.com`
- Prefijo API: `/api/v1/`
- Auth: Djoser + tokens (`Authorization: Token <token>`)
- Endpoints disponibles:
  - `POST /api/v1/auth/token/login/` → `{auth_token}`
  - `POST /api/v1/auth/token/logout/`
  - `GET  /api/v1/auth/users/me/`
  - `GET  /api/v1/songs/` (paginado, 3 por página, sin auth)
  - `GET  /api/v1/songs/:id/` (sin auth)
  - `GET  /api/v1/songs/random/` (sin auth)
  - `GET  /api/v1/songs/top/?n=3` (sin auth)
  - `GET  /api/v1/songs/search/?title=cadena` (sin auth, 404 si no hay resultados, 400 si falta param)
  - `POST /api/v1/songusers/` (REQUIERE auth, no enviar campo `user` — lo deduce del token)
- Render free tier: cold start lento (~50s primera petición). Importante para timeouts.

## Variables de entorno (`.env` en raíz del frontend)
VITE_API_BASE_URL=https://p3-songproject-12-2321-2026-v1.onrender.com/api/v1

## Rutas de la SPA
| Ruta | Vista | Auth |
|---|---|---|
| `/` | HomeView | No |
| `/log-in` | LoginView | No |
| `/log-out` | LogoutView | Sí (pero no bloquear si no hay token) |
| `/songs/:id` | PlayView | No (pero si hay token, crea SongUser al final) |
| `/faq` | FaqView | No |

## SELECTORES `data-cy` OBLIGATORIOS (los exige el test Cypress del profe)

| Selector | Componente | Notas |
|---|---|---|
| `[data-cy="login-cypress-test"]` | NavBar | Link a `/log-in` |
| `[data-cy="home-cypress-test"]` | NavBar | Link a `/` (router-link, NO recarga) |
| `[data-cy="username"]` | LoginView | input username |
| `[data-cy="password"]` | LoginView | input password |
| `[data-cy="search_text"]` | HomeView | input búsqueda |
| `[data-cy="search_button"]` | HomeView | botón buscar |
| `[data-cy="<song.title>"]` | resultados búsqueda y top | `:data-cy="song.title"` — el VALOR es el título literal |
| `[data-cy="blankInput"]` | LyricsDisplay | UN solo input visible cada vez (el del hueco actual) |
| `[data-cy="skip"]` | LyricsDisplay | botón skip |
| `id="my-audio"` | AudioPlayer | El `<audio>` debe tener `id="my-audio"` (atributo `id`, NO `data-cy`) |

## TEXTOS LITERALES OBLIGATORIOS
- Botón random debe contener el texto literal **`Random song`** (case-sensitive)
- Resumen final formato literal: **`Correct answers: X - Wrong answers: Y`** (con guion separador y espacios)

## Reglas de validación de huecos (lógica del juego)
- Una palabra correcta → audio sigue reproduciendo
- Una palabra incorrecta → audio se PAUSA hasta que el usuario acierte o pulse skip
- Si no se teclea nada y la línea termina → audio se pausa al final de la frase
- **Cada intento incorrecto cuenta como 1 fallo** (dos intentos errados en la misma palabra = 2 fallos)
- **Skip cuenta como 1 fallo**
- Al terminar la canción: mostrar `Correct answers: X - Wrong answers: Y` y, si hay token, POST a `/songusers/` con `{song, correct_guesses, wrong_guesses}`

## Formato LRC
- Metadatos `[ti:...]`, `[ar:...]` etc. → ignorar
- Líneas con timestamp: `[mm:ss.xx]Texto con {palabra} entre llaves`
- Una sola palabra entre `{}` por línea (la app no soporta varias)
- No soporta polifonía ni timestamps múltiples en una línea
- Solo se muestran 3 líneas a la vez: anterior, ACTUAL (resaltada), siguiente

## Notas críticas (lecciones aprendidas / decisiones)

1. **Token en memoria, NO localStorage.** El test del profe navega con `cy.get('[data-cy="home-cypress-test"]').click()` y comenta literalmente: *"do not go to home with visit(/) because you reload the application and token is lost"*. Esto evidencia que el token NO debe persistir tras reload — basta con Pinia en memoria.

2. **NavBar usa `<router-link>`, NUNCA `<a href>` ni `cy.visit`.** Cualquier navegación que recargue la SPA pierde el token y rompe el test.

3. **El input de hueco es UNO solo.** No renderizar inputs de huecos futuros, solo el del hueco actual. El test usa siempre el mismo selector `[data-cy="blankInput"]`.

4. **CORS:** el backend P3 debe permitir el origen del frontend desplegado. Si el test contra Render falla por CORS, ajustar `CORS_ALLOWED_ORIGINS` en backend P3.

5. **Render cold start:** el test del profe usa `timeout: 300000` (5 min) en `cy.visit('/')` precisamente por esto. No hay que optimizarlo, es comportamiento conocido del free tier.

6. **NO MODIFICAR `cypress/e2e/frontend_test.cy.js`.** Es la spec del profe. Si algo no pasa, se arregla nuestro código, no el test.

7. **Despliegue Render:** static site con nombre `4-songproject-12-2321-2026-vX` (X = versión libre).

## Comandos útiles
- `npm run dev` → arranca Vite en :5173
- `npm run lint` → ESLint
- `npm run build` → build de producción
- `npx cypress open` → Cypress GUI (ojo: el test del profe necesita backend corriendo y poblado)
- `npx cypress run` → Cypress headless
- `npm run test:unit` → Vitest

## Estado actual
Scaffold inicial completado. Pendiente:
- [ ] Limpiar HomeView/AboutView/HelloWorld por defecto
- [ ] Pinia store auth (token en memoria)
- [ ] Router con las 5 rutas
- [ ] NavBar con data-cy correctos
- [ ] HomeView (top + search + random)
- [ ] LoginView
- [ ] LogoutView (redirect a / tras 5s)
- [ ] FaqView
- [ ] Parser LRC + tests Vitest
- [ ] PlayView + AudioPlayer + LyricsDisplay
- [ ] `.env` raíz con URLs Render + neon
- [ ] Deploy Render

## Arquitectura de componentes (del enunciado, obligatorio)
PlayView.vue orquesta todo:
- Pasa props a AudioPlayer.vue: `song` (objeto), `stopAudio` (boolean)
- Pasa props a LyricsDisplay.vue: `song` (objeto), `onTimeUpdate` (tiempo)
- Escucha eventos de AudioPlayer: `onTimeUpdate` → se reenvía a LyricsDisplay
- Escucha eventos de LyricsDisplay: `stopAudio`, `startAudio`, `summary` (con correct/wrong counts)
- Si usuario autenticado y canción termina → POST a /songusers/

## Logout
Tras logout exitoso: mostrar mensaje "has salido del sistema", redirigir a `/` automáticamente tras 5 segundos.

## Devtools
Devtools de Vue debe estar activado en la versión de producción desplegada en Render. Es criterio de evaluación.

## Entrega final
- `zip -r ../assign.zip .git` desde raíz (debe incluir backend Y frontend)
- `.env` en raíz con: URL Render frontend, URL Render backend, URI neon.tech
- Usuario admin en Render: username=alumnodb, password=alumnodb
- URL Render formato: `4-songproject-12-2321-2026-vX`
