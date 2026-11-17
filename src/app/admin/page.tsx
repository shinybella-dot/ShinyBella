'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import StatCard, { StatCardSkeleton } from '@/components/admin/StatsCards';
import { Users, Building2, ClipboardList, DollarSign, CalendarClock } from 'lucide-react';

interface KPIs {
  solicitudesPendientes: number;
  solicitudesTotales: number;
  negociosActivos: number;
  usuariosTotal: number;
  citasSemana: number;
  mrr: number;
}

interface ChartsData {
  solicitudesPorEstado: Record<string, number>;
  solicitudesPorDia: { dia: string; count: number }[];
}

interface DashboardData {
  kpis: KPIs;
  charts: ChartsData;
}

const COLORS = ['#CD9FA0', '#525871', '#857C91', '#F2C1A3', '#F8CCAA'];

const EMPTY_KPIS: KPIs = {
  solicitudesPendientes: 0,
  solicitudesTotales: 0,
  negociosActivos: 0,
  usuariosTotal: 0,
  citasSemana: 0,
  mrr: 0,
};

const EMPTY_CHARTS: ChartsData = {
  solicitudesPorEstado: {},
  solicitudesPorDia: [],
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(async (res) => {
        if (!res.ok) throw new Error(`Error ${res.status} al cargar estadísticas`);
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        setData(json);
        setError(null);
      })
      .catch((err) => {
        console.error('Error loading dashboard:', err);
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las estadísticas');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-warm-steel/20 p-6 h-80" />
          <div className="bg-white rounded-2xl border border-warm-steel/20 p-6 h-80" />
        </div>
      </div>
    );
  }

  const kpis = data?.kpis ?? EMPTY_KPIS;
  const charts = data?.charts ?? EMPTY_CHARTS;

  const tasaAprobacion = kpis.solicitudesTotales > 0
    ? Math.min(100, Math.max(0, ((kpis.solicitudesTotales - kpis.solicitudesPendientes - (charts.solicitudesPorEstado.rechazada || 0)) / kpis.solicitudesTotales) * 100))
    : null;

  const estadoData = Object.entries(charts.solicitudesPorEstado).map(([estado, count], i) => ({
    estado,
    count,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-concrete">Dashboard</h1>
          <p className="text-warm-steel/60 mt-1">Resumen general de la plataforma</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Solicitudes pendientes"
          value={kpis.solicitudesPendientes}
          icon={<ClipboardList className="w-6 h-6" />}
          color="orange"
          trend={{ value: 12, label: 'vs semana pasada' }}
        />
        <StatCard
          label="Total solicitudes"
          value={kpis.solicitudesTotales}
          icon={<ClipboardList className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          label="Negocios activos"
          value={kpis.negociosActivos}
          icon={<Building2 className="w-6 h-6" />}
          color="green"
          trend={{ value: 8, label: 'vs mes pasado' }}
        />
        <StatCard
          label="Usuarios totales"
          value={kpis.usuariosTotal}
          icon={<Users className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          label="Citas esta semana"
          value={kpis.citasSemana}
          icon={<CalendarClock className="w-6 h-6" />}
          color="red"
        />
        <StatCard
          label="MRR (Mensual)"
          value={`$${kpis.mrr.toFixed(2)}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
          trend={{ value: 15, label: 'vs mes anterior' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-warm-steel/20 p-6">
          <h2 className="text-lg font-semibold text-concrete mb-4">Solicitudes por estado</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={estadoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="estado"
                  label={({ name, value }: { name?: string; value?: number }) => `${name ?? ''}: ${value ?? 0}`}
                  labelLine={false}
                >
                  {estadoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={((value: number | undefined, name: string | undefined) => [value ?? 0, name ?? 'solicitudes'] as const) as any}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            {estadoData.map((entry) => (
              <span key={entry.estado} className="flex items-center gap-1.5 text-sm text-warm-steel/70">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                {entry.estado} ({entry.count})
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-warm-steel/20 p-6">
          <h2 className="text-lg font-semibold text-concrete mb-4">Solicitudes últimos 30 días</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.solicitudesPorDia} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="dia"
                  tickFormatter={(v) => new Date(v).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                  tick={{ fontSize: 11, fill: '#857C91' }}
                  interval="preserveStartEnd"
                  dy={10}
                />
                <YAxis tick={{ fontSize: 11, fill: '#857C91' }} />
                <Tooltip
                  formatter={((value: number | undefined) => [value ?? 0, 'solicitudes'] as const) as any}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#CD9FA0"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-warm-steel/20 p-6">
          <h2 className="text-lg font-semibold text-concrete mb-4">Accesos rápidos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="/admin/solicitudes"
              className="p-4 rounded-xl border border-warm-steel/20 hover:border-accent/50 hover:bg-accent/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-concrete">Revisar solicitudes</p>
                  <p className="text-xs text-warm-steel/50">{kpis.solicitudesPendientes} pendientes</p>
                </div>
              </div>
            </a>
            <a
              href="/admin/negocios"
              className="p-4 rounded-xl border border-warm-steel/20 hover:border-accent/50 hover:bg-accent/5 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-concrete">Gestionar negocios</p>
                  <p className="text-xs text-warm-steel/50">{kpis.negociosActivos} activos</p>
                </div>
              </div>
            </a>
            <a
              href="/admin/usuarios"
              className="p-4 rounded-xl border border-warm-steel/20 hover:border-accent/50 hover:bg-accent/5 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-concrete">Ver usuarios</p>
                  <p className="text-xs text-warm-steel/50">{kpis.usuariosTotal} totales</p>
                </div>
              </div>
            </a>
            <a
              href="/admin/estadisticas"
              className="p-4 rounded-xl border border-warm-steel/20 hover:border-accent/50 hover:bg-accent/5 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-concrete">Estadísticas completas</p>
                  <p className="text-xs text-warm-steel/50">MRR: $${kpis.mrr.toFixed(2)}</p>
                </div>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-warm-steel/20 p-6">
          <h2 className="text-lg font-semibold text-concrete mb-4">Estado de la plataforma</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-warm-steel/10">
              <span className="text-warm-steel/70">Tasa de aprobación</span>
              <span className="font-semibold text-concrete">
                {tasaAprobacion === null ? 'N/A' : `${tasaAprobacion.toFixed(1)}%`}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-warm-steel/10">
              <span className="text-warm-steel/70">Promedio solicitudes/día (30d)</span>
              <span className="font-semibold text-concrete">
                {(charts.solicitudesPorDia.reduce((s, d) => s + d.count, 0) / 30).toFixed(1)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-warm-steel/10">
              <span className="text-warm-steel/70">Negocios con suscripción activa</span>
              <span className="font-semibold text-concrete">{kpis.negociosActivos}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-warm-steel/70">Ingresos recurrentes mensuales (MRR)</span>
              <span className="font-semibold text-primary">${kpis.mrr.toFixed(2)}</span>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}