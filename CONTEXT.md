# CONTEXT.md — Handoff de proyecto ShinyBella

> Documento de contexto para transferir el proyecto a otra IA o desarrollador.
> Última actualización: 2026-11-17, después de la auditoría completa y sus correcciones.

---

## 1. Visión del proyecto

Plataforma de reservas de belleza (salones y estilistas) para **Santa Ana, El Salvador**.
MVP con dos lados:

- **Cliente** explora salones y reserva citas (pago con tarjeta vía Stripe PaymentIntent).
- **Negocio** se afilia mediante solicitud con **aprobación manual** del admin, paga una
  **suscripción mensual de $60.10 USD** (plan básico, Stripe Checkout Subscription) y
  conecta su cuenta de **Stripe Connect Standard** para recibir pagos de reservas.

Reglas del producto:
- Sin aprobación + pago + conexión Stripe, el salón no queda activo ni accede al panel.
- El admin aprueba/rechaza solicitudes revisando documentos (verificación manual).
- Emails transaccionales vía Resend (aprobación, rechazo, pago fallido, etc.).

## 2. Stack y versiones

- **Next.js 16.3.5** con Turbopack, App Router, React 19, TypeScript
- **Tailwind CSS v4** — configuración con `@theme inline` en `src/app/globals.css`
  (NOTA: Tailwind v4 no usa `tailwind.config.js`; los colores son CSS variables)
- **Supabase** (auth, Postgres, Storage) con `@supabase/ssr`
- **Stripe** sdk `stripe@22`, apiVersion `'2026-08-26.dahlia'`
- **Leaflet** (mapas de salón), **Recharts** (gráficas admin)
- **react-hook-form + zod + @hookform/resolvers** (instalados con `--legacy-peer-deps`
  por conflicto de peer `effect`)
- **sonner** (toasts), **Resend** (emails), **lucide-react** (iconos — REGLA: sin emojis en la UI)

## 3. Entorno de desarrollo (quirks importantes)

- Máquina Windows, shell **PowerShell 5.1**:
  - Encadenar con `;` o `cmd1; if ($?) { cmd2 }` — NO usar `&&`
  - No existe `sed`; `ls -la` no funciona (usar `Get-ChildItem`)
- Directorio del proyecto: `C:\Users\MINED\Desktop\ShinyBella\shinybella-proto`
- `npm run build` funciona y está limpio (35 rutas); warning conocido de Next 16:
  `middleware` deprecado ("use proxy instead") — solo warning, funciona igual.

## 4. Git y despliegue

- Repo GitHub: `https://github.com/shinybella-dot/ShinyBella.git` (rama `master`)
  - El remote cambió de nombre (`shinybella` → `ShinyBella`); push con
    `git push origin master` funciona y GitHub avisa del rename.
- **Vercel auto-despliega desde `master`** → producción: `https://shiny-bella.vercel.app/`
- Commits recientes:
  - `6c98ad4` Ultima versión estable (auditoría completa + correcciones)
  - `bcb0695` feat: Flujo completo negocio post-aprobación (Fase 4)
  - `473d0cd` feat: Wizard de afiliación 3 pasos + API /api/afiliacion
  - `8701e12` feat: Admin panel completo
  - `66d5497` fix: API pago no depende de SUPABASE_SERVICE_ROLE_KEY (fallback a anon)
  - `5b39425` Fix móvil horarios (TimeSlotPicker con chips, no tabla ancha)
  - `5695a77` Fix colores Tailwind v4, seguridad, checkout atómico

## 5. Supabase (BD y Storage)

- Proyecto: `fuzyzoxtvpxkcxxhkmyh.supabase.co`
- **Migraciones YA EJECUTADAS por el usuario en SQL Editor** (no hay CLI de Supabase):
  - Fase 0: tabla `profiles` con columna `rol` (`cliente`/`negocio`/`admin`),
    extensión de `salones`, tabla `solicitudes_afiliacion`, políticas RLS de
    `salones` y `solicitudes_afiliacion`, bucket de Storage `verificaciones`
  - `supabase_complete_fix.sql` y `supabase_recreate_fks.sql` ejecutados
  - `supabase_rpc_create_reserva.sql` ejecutado (RPC para crear reservas)
- **PENDIENTE PARA EJECUTAR EN SQL EDITOR** (en este orden):
  1. `supabase_reservas_fix.sql` — constraint único anti doble-reserva, columnas `codigo`/`actualizado_en`, políticas RLS
  2. `supabase_rpc_create_reserva.sql` — RPC reescrita con `auth.uid()` (firma nueva, sin `p_user_id`; retorna `codigo`)
  3. `supabase_afiliacion_fix.sql` — columna `folio`, policies del bucket `verificaciones`
  4. `supabase_negocio_fix.sql` — columna `stripe_customer_id` (informativa; el código ya no la usa)
  5. `supabase_salon_images.sql` — galería de imágenes
- La columna `stripe_customer_id` ya NO se escribe desde `stripe-verify` (se quitó para desbloquear el flujo).
- La cuenta del usuario dueño del proyecto tiene `rol='admin'` en `profiles`.
- `SUPABASE_SERVICE_ROLE_KEY` es **requerido** por `/api/afiliacion` (usa
  `auth.admin.createUser`). Sin él ese endpoint devuelve 503. El helper
  `getSupabaseAdmin` avisa cuando falta. Pendiente de agregar en local y Vercel.
- Los docs de verificación se suben a Storage bucket `verificaciones`.

## 6. Variables de entorno (estado actual)

**Stripe está en TEST MODE** (decisión: seguir en test hasta validar todo; al pasar a
live hay que recrear Price y Webhook y cambiar las keys).

Locales (`.env.local`) — 10 vars:
```
NEXT_PUBLIC_SUPABASE_URL=https://fuzyzoxtvpxkcxxhkmyh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID_BASICO=price_1UUjQ24PZG6OUBWjr4R99VOD
STRIPE_WEBHOOK_SECRET=whsec_XLeH...  (endpoint "Tu cuenta")
STRIPE_WEBHOOK_SECRET_CONNECT=...     (PENDIENTE: endpoint "Cuentas conectadas")
RESEND_API_KEY=re_Cx1SSqsg...
RESEND_FROM_EMAIL=ShinyBella <onboarding@resend.dev>  (debe ser dominio verificado en Resend)
NEXT_PUBLIC_APP_URL=http://localhost:3000   (en Vercel: https://shiny-bella.vercel.app)
SUPABASE_SERVICE_ROLE_KEY=...  (PENDIENTE: requerido para auth.admin.createUser en /api/afiliacion)
```

Vercel (Environment Variables):
- Las 4 originales: Supabase URL/anon, Stripe pk_test/sk_test
- Las 4 nuevas (ya agregadas + redeploy hecho):
  - `STRIPE_PRICE_ID_BASICO` (Secret)
  - `STRIPE_WEBHOOK_SECRET` (Secret)
  - `RESEND_API_KEY` (Secret)
  - `NEXT_PUBLIC_APP_URL` (Config — las `NEXT_PUBLIC_*` solo pueden ser Config
    porque se exponen al navegador por diseño de Next.js)
- PENDIENTE de agregar en Vercel:
  - `SUPABASE_SERVICE_ROLE_KEY` (Secret) — requerido por `/api/afiliacion`
  - `RESEND_FROM_EMAIL` (Secret) — dominio verificado en Resend
  - `STRIPE_WEBHOOK_SECRET_CONNECT` (Secret) — segundo endpoint de Stripe

**Stripe Dashboard (test mode):**
- Product: `prod_VVkvFKRn7OG4oi` "Plan Básico ShinyBella" — Price: `price_1UUjQ24PZG6OUBWjr4R99VOD` ($60.10/mes recurrente)
- Webhook endpoint existente apuntando a `https://shiny-bella.vercel.app/api/webhook/stripe`
  con eventos: `customer.subscription.created|updated|deleted`, `invoice.payment_failed`.
  Ámbito: "Tu cuenta".
- Stripe no permite un solo endpoint con ambos ámbitos: hay que crear un **segundo**
  endpoint con la misma URL, ámbito "Cuentas conectadas" y evento `account.updated`.
  El handler prueba ambos secrets (`STRIPE_WEBHOOK_SECRET` y
  `STRIPE_WEBHOOK_SECRET_CONNECT`).

## 7. Arquitectura de la app (rutas y archivos clave)

### Rutas públicas
- `/` home, `/salon/[id]` detalle de salón (mapa Leaflet, horarios, servicios, checkout)
- `/checkout` pago de reserva con Stripe Payment Elements
- `/confirmacion/[id]` confirmación de reserva
- `/mis-citas`, `/perfil` (cliente)
- `/auth/login`, `/auth/registro`, `/auth/verificar` (efecto glitch/blur canvas),
  `/auth/callback`
- `/privacidad`, `/terminos`

### Afiliación de negocio
- `/afiliarse` — wizard de 3 pasos (`src/components/auth/WizardSteps.tsx`, dynamic import)
  - Paso 1: datos + dirección con **geocoding Nominatim** (gratis) en blur, lat/lng en state local
  - Paso 2: servicios y estilistas
  - Paso 3: imágenes + documentos → `FileUpload` → Storage bucket `verificaciones`
  - Persistencia en localStorage entre pasos
- `src/lib/validations/negocio.ts` — schemas zod (paso1/2/3 + wizard)
- `POST /api/afiliacion` — valida con zod, crea auth user (`auth.admin.createUser`,
  requiere `SUPABASE_SERVICE_ROLE_KEY`) + profile(rol=negocio) + salon(inactivo,
  pendiente) + solicitud con folio, con rollback completo. Los documentos se suben
  a Storage bucket `verificaciones` y se visualizan vía `/api/admin/documentos` (signed URLs).

### Admin (`/admin/*`, protegido por middleware rol=admin)
- `/admin` — KPIs + gráficas Recharts
- `/admin/solicitudes` — DataTable + modal detalle (tabs: datos, servicios, docs con
  DocumentViewer) + aprobar/rechazar → al aprobar envía email Resend con link a
  `/negocio/pago-plan?salon_id=...`
- `/admin/negocios` — lista + toggle activo/inactivo
- `/admin/usuarios` — cambiar rol, ban
- `/admin/estadisticas` — pie/area/funnel/bar/line
- API: `/api/admin/{stats, solicitudes, negocios, negocios/[id], usuarios, usuarios/[id]}`
- Auth check en TODOS los API routes admin/negocio vía `src/lib/api-auth.ts`
  (`requireAdmin()`, `requireSalonOwner()`, `isApiError()`), con verificación de
  sesión real (`auth.getUser()`) y rol desde `profiles` (NO desde user_metadata)

### Negocio (`/negocio/*`, middleware exige rol negocio|admin)
- `/negocio/estado` — vista central de estado de la solicitud/plan:
  `pendiente` → `aprobada_sin_pago` → `conectando_stripe` → `activo` |
  `rechazada` | `suspendida` (derivado en `src/hooks/useNegocio.ts`)
- `/negocio/pago-plan` — botón que llama `POST /api/negocio/stripe-checkout`
  (Checkout Session mode=subscription con `STRIPE_PRICE_ID_BASICO`, metadata salon_id,
  success_url → `/negocio/conectar-stripe?session_id=...`)
- `/negocio/conectar-stripe` — verifica el pago (stripe-verify) y lanza onboarding
  de **Stripe Connect Standard** (`POST /api/negocio/stripe-connect` crea account +
  account link, callback guarda `stripe_account_id`)
- `/negocio/dashboard` — layout con `NegocioSidebar` (responsive) + 8 tabs:
  Dashboard, Mi salón, Imágenes, Servicios, Estilistas, Horarios, Reservas, Estadísticas
  **IMPORTANTE: los tabs son PLACEHOLDERS con datos hardcodeados; solo Dashboard y
  estructura funcionan. Falta el CRUD real que lea/escriba Supabase.**

### API negocio/Stripe
- `POST /api/negocio/stripe-checkout` — Checkout Session subscription
- `POST /api/negocio/stripe-connect` — Connect Standard account link
- `GET  /api/negocio/stripe-verify` — verifica session_id, guarda
  `stripe_subscription_id`, valida que el salón pertenezca al usuario autenticado
- `POST /api/webhook/stripe` — maneja `customer.subscription.*` (activa/desactiva
  salón), `invoice.payment_failed` (email + desactiva), `account.updated`
  (guarda stripe_account_id + email si onboarding completo)

### API pagos cliente
- `POST /api/create-payment-intent` — usa `getSupabaseAdmin` con fallback anon;
  verificado E2E local (clientSecret OK, montos correctos contra BD)

### Componentes UI reutilizables (`src/components/ui/`)
- `DataTable` (genérica), `Modal` y `ConfirmDialog` (default exports, ConfirmDialog
  acepta `children`), `Tabs` (TabsList/TabsTrigger/TabsContent), `Badge` (default export),
  `StatsCards`, `DocumentViewer`, `FileUpload`, `TimeSlotPicker`
  (móvil: chips de día `grid-cols-7` + chips estilista + grid `grid-cols-4`)

### Hooks y lib
- `src/hooks/useAuth.ts` — user/profile/rol/hasRole
- `src/hooks/useNegocio.ts` — salón del dueño + estado derivado
- `src/lib/resend.ts` — 5 templates de email, **lazy-init** del cliente Resend para
  que el build no falle sin `RESEND_API_KEY`
- `src/middleware.ts` — protege `/admin/*` (admin) y `/negocio/*` (negocio|admin),
  redirect a `/unauthorized`

## 8. Flujo completo de negocio (para probar)

```
1. Cliente registra cuenta → reserva en un salón → paga (PaymentIntent)
2. Negocio → /afiliarse (wizard) → crea user + profile + salón + solicitud
3. Admin → /admin/solicitudes → aprueba → email con link de pago
4. Dueño → /negocio/pago-plan → Stripe Checkout ($60.10/mes, test con
   4242 4242 4242 4242) → redirect a conectar-stripe
5. conectar-stripe → onboarding Connect Standard → guarda stripe_account_id
6. Dashboard /negocio/dashboard desbloqueado
```

## 9. Diseño visual

Paleta (CSS variables en `globals.css` con `@theme inline`):
- Concrete `#525871`, Warm Steel `#857C91`, Rosewood `#CD9FA0`,
  Peaches & Cream `#F2C1A3`, Dawn `#F8CCAA`
- Iconos siempre con lucide-react, **nunca emojis**
- Animaciones utilitarias definidas en globals.css (`animate-slide-up`, etc.)

## 10. Tareas pendientes (roadmap inmediato)

1. **Ejecutar los 5 SQL listados en §5** en Supabase SQL Editor (CRÍTICO: sin la RPC nueva,
   el checkout no puede guardar reservas)
2. **Agregar `SUPABASE_SERVICE_ROLE_KEY`** en Vercel + `.env.local` (CRÍTICO: sin ella,
   `/api/afiliacion` devuelve 503)
3. **Verificar dominio de `RESEND_FROM_EMAIL`** en Resend y configurarlo en Vercel
4. **Crear segundo webhook de Stripe con ámbito "Cuentas conectadas"** (evento
   `account.updated`) y agregar su secret como `STRIPE_WEBHOOK_SECRET_CONNECT` en Vercel
5. **Prueba E2E en Vercel** de todo el flujo (el dueño prueba y reporta errores)
6. **CRUD reales** en los tabs del dashboard de negocio — hoy placeholders
7. Rotar claves expuestas (Supabase anon, Stripe sk_test) antes de ir a live
8. Al pasar a live: recrear Product/Price y Webhook en live mode, cambiar keys en Vercel
9. UX/visual del selector de horarios (pospuesto por decisión del dueño)
10. Nota registrada: **el registro público (`/auth/registro`) no ofrece selector de rol** —
    es intencional: clientes se registran ahí (rol `cliente`), negocios usan `/afiliarse`
    (rol `negocio`), admins se asignan manualmente en BD. Nunca permitir que el usuario
    se auto-asigne `admin` en el formulario público.

## 11. Decisiones ya tomadas (no re-discutir)

- Docs de verificación en **Supabase Storage** (bucket `verificaciones`)
- **Stripe Connect Standard** (no Express)
- Plan básico = **suscripción mensual $60.10** (no pago único)
- Server Actions/API Routes (no Supabase Edge Functions)
- DataTable genérica propia
- Emails con **Resend** (no Supabase SMTP)
- Geocoding con **Nominatim** (gratis, sin API key)
- Sin Stripe CLI ni Supabase CLI — verificación directa en Vercel/SQL Editor
- `SUPABASE_SERVICE_ROLE_KEY` requerido para afiliación; se agregará en local y Vercel
- El dueño prueba en Vercel y pide correcciones; la parte visual de horarios va al final
