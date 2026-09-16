# ShinyBella - PMV Web Prototype

Plataforma digital para agendar citas de belleza en Santa Ana, El Salvador.

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Mapa**: Leaflet + OpenStreetMap (gratis, sin API keys)
- **Backend/Auth/DB**: Supabase (PostgreSQL + Auth + Realtime)
- **Pagos**: Stripe (modo test)
- **Deploy**: Vercel

## 🎨 Paleta de Colores

| Nombre | Hex | Uso |
|--------|-----|-----|
| Concrete | `#525871` | Primario, texto principal |
| Warm Steel | `#857C91` | Secundario, textos muted |
| Rosewood | `#CD9FA0` | Acento, botones destacados |
| Peaches & Cream | `#F2C1A3` | Superficies, cards |
| Dawn | `#F8CCAA` | Fondo principal |

## 📦 Instalación

```bash
# 1. Clonar/entrar al proyecto
cd shinybella-proto

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con tus claves

# 4. Ejecutar en desarrollo
npm run dev
```

## 🔑 Configuración de Servicios

### Supabase (Gratis)
1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a Settings → API → copiar `Project URL` y `anon public key`
3. En SQL Editor, ejecutar el schema de `supabase-schema.sql` (ver abajo)
4. Authentication → Providers → habilitar Email + Google/GitHub si deseas

### Stripe (Modo Test - Gratis)
1. Crear cuenta en [stripe.com](https://stripe.com)
2. Developers → API keys → copiar `Publishable key` y `Secret key` (modo test)
3. Developers → Webhooks → agregar endpoint: `https://tu-dominio.vercel.app/api/stripe-webhook`
   - Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`

### Vercel (Gratis)
1. Conectar repo de GitHub/GitLab
2. Framework preset: Next.js
3. Environment Variables: agregar todas las de `.env.local`
4. Deploy automático en cada push

## 🗄️ Schema de Base de Datos (Supabase)

Ejecuta esto en el **SQL Editor** de Supabase:

```sql
-- Extensiones
create extension if not exists "uuid-ossp";

-- Tabla: salones
create table salones (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  direccion text not null,
  lat double precision not null,
  lng double precision not null,
  telefono text not null,
  rating numeric(2,1) default 0,
  imagen_url text,
  activo boolean default true,
  created_at timestamptz default now()
);

-- Tabla: servicios
create table servicios (
  id uuid primary key default uuid_generate_v4(),
  salon_id uuid references salones(id) on delete cascade,
  nombre text not null,
  descripcion text,
  precio numeric(10,2) not null,
  duracion_min integer not null,
  categoria text not null,
  activo boolean default true
);

-- Tabla: estilistas
create table estilistas (
  id uuid primary key default uuid_generate_v4(),
  salon_id uuid references salones(id) on delete cascade,
  nombre text not null,
  especialidad text,
  imagen_url text,
  activo boolean default true
);

-- Tabla: disponibilidad
create table disponibilidad (
  id uuid primary key default uuid_generate_v4(),
  estilista_id uuid references estilistas(id) on delete cascade,
  dia_semana integer not null, -- 1=Lun, 7=Dom
  hora_inicio time not null,
  hora_fin time not null
);

-- Tabla: reservas
create table reservas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  salon_id uuid references salones(id) on delete cascade,
  servicio_id uuid references servicios(id) on delete cascade,
  estilista_id uuid references estilistas(id) on delete cascade,
  fecha date not null,
  hora time not null,
  estado text default 'pendiente' check (estado in ('pendiente','confirmada','cancelada','completada')),
  payment_intent_id text,
  created_at timestamptz default now()
);

-- RLS (Row Level Security)
alter table salones enable row level security;
alter table servicios enable row level security;
alter table estilistas enable row level security;
alter table disponibilidad enable row level security;
alter table reservas enable row level security;

-- Políticas: lectura pública para salones/servicios/estilistas activos
create policy "Public read active salones" on salones for select using (activo = true);
create policy "Public read active servicios" on servicios for select using (activo = true);
create policy "Public read active estilistas" on estilistas for select using (activo = true);
create policy "Public read disponibilidad" on disponibilidad for select using (true);

-- Políticas: usuarios ven solo sus reservas
create policy "Users read own reservas" on reservas for select using (auth.uid() = user_id);
create policy "Users insert own reservas" on reservas for insert with check (auth.uid() = user_id);
create policy "Users update own reservas" on reservas for update using (auth.uid() = user_id);

-- Índices
create index idx_salones_location on salones(lat, lng);
create index idx_servicios_salon on servicios(salon_id);
create index idx_estilistas_salon on estilistas(salon_id);
create index idx_reservas_user on reservas(user_id);
create index idx_reservas_fecha on reservas(fecha);
```

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── page.tsx                 # Home: mapa + lista salones
│   ├── salon/[id]/page.tsx      # Detalle salón + servicios + agenda
│   ├── checkout/[id]/page.tsx   # Pago con Stripe
│   ├── confirmacion/[id]/page.tsx # Confirmación post-pago
│   ├── mis-citas/page.tsx       # Mis reservas (requiere login)
│   ├── auth/
│   │   ├── login/page.tsx       # Inicio de sesión
│   │   └── registro/page.tsx    # Registro
│   └── api/
│       └── create-payment-intent/route.ts  # Stripe PaymentIntent
├── components/
│   ├── Header.tsx               # Navegación principal
│   ├── Footer.tsx               # Pie de página
│   ├── MapaSalones.tsx          # Mapa Leaflet interactivo
│   ├── SalonCard.tsx            # Tarjeta de salón
│   ├── ServiceCard.tsx          # Tarjeta de servicio
│   └── TimeSlotPicker.tsx       # Selector fecha/hora/estilista
└── lib/
    ├── supabase.ts              # Cliente Supabase
    ├── types.ts                 # Tipos TypeScript
    └── mockData.ts              # Datos mock para demo
```

## 🧪 Flujo de Prueba (Demo)

1. **Home** (`/`) → Ver mapa con salones, click en uno
2. **Salón** (`/salon/1`) → Ver servicios, elegir uno
3. **Agenda** → Elegir estilista, fecha, hora
4. **Checkout** → Paga con tarjeta de prueba: `4242 4242 4242 4242` (cualquier fecha futura, CVC cualquiera)
5. **Confirmación** → Ver código QR y detalles

## 📱 Páginas Implementadas

| Ruta | Descripción |
|------|-------------|
| `/` | Home con mapa interactivo + sidebar salones |
| `/salon/[id]` | Detalle salón, catálogo servicios, agenda |
| `/checkout/[id]` | Formulario pago Stripe |
| `/confirmacion/[id]` | Confirmación + código QR |
| `/mis-citas` | Mis reservas (auth required) |
| `/auth/login` | Login email/password + OAuth |
| `/auth/registro` | Registro con validación |

## 🎯 Próximos Pasos (Post-PMV)

- [ ] Panel de administración para salones (B2B)
- [ ] Notificaciones push/email/WhatsApp (Twilio/SendGrid)
- [ ] Sistema de reviews y calificaciones
- [ ] Suscripciones B2B ($60/mes) + comisiones ($2/cita)
- [ ] App nativa (React Native / Expo)
- [ ] Analytics (Mixpanel/PostHog)

## 📝 Licencia

Proyecto académico - Materia de Emprendimiento - Equipo ShinyBella