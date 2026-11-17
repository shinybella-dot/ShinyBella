'use client';

import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { useNegocioTab } from '@/components/negocio/NegocioSidebar';
import { LayoutDashboard, Building2, Image, Scissors, Users, CalendarClock, Calendar, BarChart3, Plus, AlertCircle, DollarSign, TrendingUp, User, X } from 'lucide-react';
import { useNegocio } from '@/hooks/useNegocio';

interface SalonResumen {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  horario?: string | null;
  imagen_url: string | null;
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'perfil', label: 'Mi salón', icon: Building2 },
  { id: 'imagenes', label: 'Imágenes', icon: Image },
  { id: 'servicios', label: 'Servicios', icon: Scissors },
  { id: 'estilistas', label: 'Estilistas', icon: Users },
  { id: 'horarios', label: 'Horarios', icon: CalendarClock },
  { id: 'reservas', label: 'Reservas', icon: Calendar },
  { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
];

export default function NegocioDashboardPage() {
  const { salon, estado } = useNegocio();
  const { activeTab, setActiveTab } = useNegocioTab();

  if (estado !== 'activo') {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-2xl border border-warm-steel/20 p-8">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-concrete mb-2">Salón no activo</h1>
          <p className="text-warm-steel/60 mb-6">
            Tu salón debe estar activo para acceder al panel de gestión.
            <br />
            Revisa el estado en <Link href="/negocio/estado" className="text-accent hover:underline">Estado de mi solicitud</Link>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-concrete">Panel de gestión</h1>
        <p className="text-warm-steel/60 mt-1">Gestiona tu salón: {salon?.nombre}</p>
      </div>

      <Tabs key={activeTab} defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 sm:grid-cols-8 gap-2 mb-6">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center justify-center gap-1.5 py-2.5">
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="dashboard">
          <DashboardTab onTabChange={setActiveTab} />
        </TabsContent>
        <TabsContent value="perfil">
          <PerfilTab salon={salon!} />
        </TabsContent>
        <TabsContent value="imagenes">
          <ImagenesTab salon={salon!} />
        </TabsContent>
        <TabsContent value="servicios">
          <ServiciosTab />
        </TabsContent>
        <TabsContent value="estilistas">
          <EstilistasTab />
        </TabsContent>
        <TabsContent value="horarios">
          <HorariosTab />
        </TabsContent>
        <TabsContent value="reservas">
          <ReservasTab />
        </TabsContent>
        <TabsContent value="estadisticas">
          <EstadisticasTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DashboardTab({ onTabChange }: { onTabChange: (tab: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Reservas hoy" value="3" icon={<Calendar className="w-6 h-6" />} color="blue" />
        <StatCard label="Esta semana" value="12" icon={<Calendar className="w-6 h-6" />} color="green" />
        <StatCard label="Ingresos mes" value="$450" icon={<DollarSign className="w-6 h-6" />} color="purple" />
        <StatCard label="Nuevos clientes" value="8" icon={<Users className="w-6 h-6" />} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-warm-steel/20 p-6">
          <h3 className="font-semibold text-concrete mb-4">Próximas reservas</h3>
          <div className="space-y-3">
            <ReservaRow hora="10:00" cliente="María G." servicio="Corte + Tinte" estilista="Ana M." estado="confirmada" />
            <ReservaRow hora="11:30" cliente="Carlos R." servicio="Corte clásico" estilista="Roberto D." estado="pendiente" />
            <ReservaRow hora="15:00" cliente="Laura P." servicio="Manicure spa" estilista="Sofía H." estado="confirmada" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-warm-steel/20 p-6">
          <h3 className="font-semibold text-concrete mb-4">Acciones rápidas</h3>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => onTabChange('servicios')} className="p-4 rounded-xl border border-warm-steel/20 hover:border-accent/50 hover:bg-accent/5 transition-all text-left">
              <Plus className="w-5 h-5 text-accent mb-2" />
              <p className="font-medium text-concrete">Nuevo servicio</p>
            </button>
            <button type="button" onClick={() => onTabChange('estilistas')} className="p-4 rounded-xl border border-warm-steel/20 hover:border-accent/50 hover:bg-accent/5 transition-all text-left">
              <Plus className="w-5 h-5 text-accent mb-2" />
              <p className="font-medium text-concrete">Nuevo estilista</p>
            </button>
            <button type="button" onClick={() => onTabChange('horarios')} className="p-4 rounded-xl border border-warm-steel/20 hover:border-accent/50 hover:bg-accent/5 transition-all text-left">
              <Plus className="w-5 h-5 text-accent mb-2" />
              <p className="font-medium text-concrete">Configurar horarios</p>
            </button>
            <button type="button" onClick={() => onTabChange('imagenes')} className="p-4 rounded-xl border border-warm-steel/20 hover:border-accent/50 hover:bg-accent/5 transition-all text-left">
              <Plus className="w-5 h-5 text-accent mb-2" />
              <p className="font-medium text-concrete">Subir imágenes</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PerfilTab({ salon }: { salon: SalonResumen }) {
  return (
    <div className="bg-white rounded-2xl border border-warm-steel/20 p-6">
      <h3 className="font-semibold text-concrete mb-6">Información del salón</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-concrete mb-1">Nombre</label>
          <input value={salon.nombre} readOnly className="w-full px-4 py-3 bg-surface-light border border-warm-steel/20 rounded-xl text-concrete" />
        </div>
        <div>
          <label className="block text-sm font-medium text-concrete mb-1">Email</label>
          <input value={salon.email} readOnly className="w-full px-4 py-3 bg-surface-light border border-warm-steel/20 rounded-xl text-concrete" />
        </div>
        <div>
          <label className="block text-sm font-medium text-concrete mb-1">Teléfono</label>
          <input value={salon.telefono} readOnly className="w-full px-4 py-3 bg-surface-light border border-warm-steel/20 rounded-xl text-concrete" />
        </div>
        <div>
          <label className="block text-sm font-medium text-concrete mb-1">Dirección</label>
          <input value={salon.direccion} readOnly className="w-full px-4 py-3 bg-surface-light border border-warm-steel/20 rounded-xl text-concrete" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-concrete mb-1">Horario</label>
          <textarea value={salon.horario || 'Lunes a Sábado: 8:00 - 20:00'} readOnly rows={2} className="w-full px-4 py-3 bg-surface-light border border-warm-steel/20 rounded-xl text-concrete resize-none" />
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-warm-steel/20">
        <button className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-concrete">
          Editar información
        </button>
      </div>
    </div>
  );
}

function ImagenesTab({ salon }: { salon: SalonResumen }) {
  const images = salon.imagen_url ? [salon.imagen_url] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-concrete">Galería del salón</h3>
        <button type="button" className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-concrete flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Subir imágenes
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-warm-steel/20">
            <img src={img} alt={`Imagen ${i + 1}`} className="w-full h-full object-cover" />
            <button className="absolute top-2 right-2 p-1 bg-red-500/90 text-white rounded-full hover:bg-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {images.length < 10 && (
          <div className="aspect-square rounded-xl border-2 border-dashed border-warm-steel/30 flex flex-col items-center justify-center gap-2 text-warm-steel/50 cursor-pointer">
            <Plus className="w-8 h-8" />
            <span className="text-sm">Añadir imagen</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ServiciosTab() {
  return (
    <div className="bg-white rounded-2xl border border-warm-steel/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-concrete">Servicios</h3>
        <button className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-concrete flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo servicio
        </button>
      </div>
      <div className="space-y-3">
        <ServicioRow nombre="Corte de cabello" precio="$15.00" duracion="45 min" categoria="Cabello" activo />
        <ServicioRow nombre="Tinte completo" precio="$35.00" duracion="90 min" categoria="Cabello" activo />
        <ServicioRow nombre="Manicure spa" precio="$18.00" duracion="60 min" categoria="Uñas" activo />
      </div>
    </div>
  );
}

function EstilistasTab() {
  return (
    <div className="bg-white rounded-2xl border border-warm-steel/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-concrete">Estilistas</h3>
        <button className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-concrete flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo estilista
        </button>
      </div>
      <div className="space-y-3">
        <EstilistaRow nombre="Ana Martínez" especialidad="Colorimetría" activo />
        <EstilistaRow nombre="Carlos Rodríguez" especialidad="Barbería" activo />
      </div>
    </div>
  );
}

function HorariosTab() {
  return (
    <div className="bg-white rounded-2xl border border-warm-steel/20 p-6">
      <h3 className="font-semibold text-concrete mb-6">Configurar horarios por estilista</h3>
      <p className="text-warm-steel/60">Próximamente: editor visual semanal por estilista</p>
    </div>
  );
}

function ReservasTab() {
  return (
    <div className="bg-white rounded-2xl border border-warm-steel/20 p-6">
      <h3 className="font-semibold text-concrete mb-6">Reservas</h3>
      <div className="space-y-3">
        <ReservaRow hora="10:00" cliente="María G." servicio="Corte + Tinte" estilista="Ana M." estado="confirmada" />
        <ReservaRow hora="11:30" cliente="Carlos R." servicio="Corte clásico" estilista="Roberto D." estado="pendiente" />
        <ReservaRow hora="15:00" cliente="Laura P." servicio="Manicure spa" estilista="Sofía H." estado="confirmada" />
      </div>
    </div>
  );
}

function EstadisticasTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Reservas mes" value="42" icon={<Calendar className="w-6 h-6" />} color="blue" />
        <StatCard label="Ingresos" value="$1,250" icon={<DollarSign className="w-6 h-6" />} color="green" />
        <StatCard label="Clientes únicos" value="28" icon={<Users className="w-6 h-6" />} color="purple" />
        <StatCard label="Ocupación" value="78%" icon={<TrendingUp className="w-6 h-6" />} color="orange" />
      </div>
      <div className="bg-white rounded-2xl border border-warm-steel/20 p-6">
        <h3 className="font-semibold text-concrete mb-4">Reservas por servicio (últimos 30 días)</h3>
        <div className="h-64 flex items-center justify-center text-warm-steel/50">
          Gráfico de barras - Próximamente
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-600 border-blue-200',
    green: 'bg-green-500/10 text-green-600 border-green-200',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-200',
    orange: 'bg-orange-500/10 text-orange-600 border-orange-200',
  };
  return (
    <div className="bg-white rounded-2xl border border-warm-steel/20 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-warm-steel/60">{label}</p>
          <p className="text-3xl font-bold text-concrete mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl border ${colors[color]}`}>{icon}</div>
      </div>
    </div>
  );
}

function ReservaRow({ hora, cliente, servicio, estilista, estado }: { hora: string; cliente: string; servicio: string; estilista: string; estado: string }) {
  const estadoColors: Record<string, string> = {
    confirmada: 'bg-green-50 text-green-700',
    pendiente: 'bg-orange-50 text-orange-700',
    cancelada: 'bg-red-50 text-red-700',
    completada: 'bg-blue-50 text-blue-700',
  };
  return (
    <div className="flex items-center justify-between p-3 bg-surface-light rounded-xl">
      <div className="flex items-center gap-4">
        <span className="font-mono text-concrete w-16">{hora}</span>
        <div>
          <p className="font-medium text-concrete">{cliente}</p>
          <p className="text-sm text-warm-steel/60">{servicio} · {estilista}</p>
        </div>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoColors[estado] || 'bg-gray-50 text-gray-700'}`}>
        {estado}
      </span>
    </div>
  );
}

function ServicioRow({ nombre, precio, duracion, categoria, activo }: { nombre: string; precio: string; duracion: string; categoria: string; activo: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 bg-surface-light rounded-xl">
      <div>
        <p className="font-medium text-concrete">{nombre}</p>
        <p className="text-sm text-warm-steel/60">{categoria} · {duracion} · {precio}</p>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${activo ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}`}>
        {activo ? 'Activo' : 'Inactivo'}
      </span>
    </div>
  );
}

function EstilistaRow({ nombre, especialidad, activo }: { nombre: string; especialidad: string; activo: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 bg-surface-light rounded-xl">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center">
          <User className="w-5 h-5 text-warm-steel/40" />
        </div>
        <div>
          <p className="font-medium text-concrete">{nombre}</p>
          <p className="text-sm text-warm-steel/60">{especialidad}</p>
        </div>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${activo ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}`}>
        {activo ? 'Activo' : 'Inactivo'}
      </span>
    </div>
  );
}

