'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import StatCard from '@/components/admin/StatsCards';
import { Users, Building2, ClipboardList, DollarSign, CalendarClock } from 'lucide-react';

interface EstadisticasData {
  kpis: {
    solicitudesPendientes: number;
    solicitudesTotales: number;
    negociosActivos: number;
    usuariosTotal: number;
    citasSemana: number;
    mrr: number;
  };
  charts: {
    solicitudesPorEstado: Record<string, number>;
    solicitudesPorDia: { dia: string; count: number }[];
    usuariosPorRol: Record<string, number>;
    citasPorMes: { mes: string; count: number }[];
    ingresosPorMes: { mes: string; mrr: number }[];
  };
}

const COLORS = ['#CD9FA0', '#525871', '#857C91', '#F2C1A3', '#F8CCAA', '#F5E6D3'];

const EMPTY_DATA: EstadisticasData = {
  kpis: {
    solicitudesPendientes: 0,
    solicitudesTotales: 0,
    negociosActivos: 0,
    usuariosTotal: 0,
    citasSemana: 0,
    mrr: 0,
  },
  charts: {
    solicitudesPorEstado: {},
    solicitudesPorDia: [],
    usuariosPorRol: {},
    citasPorMes: [],
    ingresosPorMes: [],
  },
};

export default function AdminEstadisticasPage() {
  const [data, setData] = useState<EstadisticasData | null>(null);
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
        console.error('Error loading stats:', err);
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

  const kpis = data?.kpis ?? EMPTY_DATA.kpis;
  const charts = data?.charts ?? EMPTY_DATA.charts;

  const estadoData = Object.entries(charts.solicitudesPorEstado).map(([estado, count], i) => ({
    estado,
    count,
    fill: COLORS[i % COLORS.length],
  }));

  const rolData = Object.entries(charts.usuariosPorRol).map(([rol, count], i) => ({
    rol,
    count,
    fill: COLORS[i % COLORS.length],
  }));

  const conversionData = [
    { etapa: 'Solicitudes', count: kpis.solicitudesTotales },
    { etapa: 'En revisión', count: charts.solicitudesPorEstado.en_revision || 0 },
    { etapa: 'Aprobadas', count: charts.solicitudesPorEstado.aprobada || 0 },
    { etapa: 'Activas (con pago)', count: kpis.negociosActivos },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-concrete">Estadísticas avanzadas</h1>
          <p className="text-warm-steel/60 mt-1">Métricas detalladas de la plataforma</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Solicitudes pendientes"
          value={kpis.solicitudesPendientes}
          icon={<ClipboardList className="w-6 h-6" />}
          color="orange"
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
                  formatter={((value: number | undefined, name: string | undefined) => [value ?? 0, name ?? ''] as const) as any}
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
          <h2 className="text-lg font-semibold text-concrete mb-4">Usuarios por rol</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rolData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="rol"
                  label={({ name, value }: { name?: string; value?: number }) => `${name ?? ''}: ${value ?? 0}`}
                  labelLine={false}
                >
                  {rolData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={((value: number | undefined, name: string | undefined) => [value ?? 0, name ?? ''] as const) as any}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            {rolData.map((entry) => (
              <span key={entry.rol} className="flex items-center gap-1.5 text-sm text-warm-steel/70">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                {entry.rol} ({entry.count})
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-warm-steel/20 p-6">
          <h2 className="text-lg font-semibold text-concrete mb-4">Solicitudes últimos 30 días</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.solicitudesPorDia} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSolicitudes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#CD9FA0" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#CD9FA0" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                  formatter={((value: number | undefined, name: string | undefined) => [value ?? 0, name ?? ''] as const) as any}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#CD9FA0"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSolicitudes)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-warm-steel/20 p-6">
          <h2 className="text-lg font-semibold text-concrete mb-4">Embudo de conversión</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionData} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#857C91' }} />
                <YAxis
                  type="category"
                  dataKey="etapa"
                  tick={{ fontSize: 11, fill: '#857C91' }}
                  width={140}
                />
                <Tooltip
                  formatter={((value: number | undefined) => [value ?? 0, 'registros'] as const) as any}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#CD9FA0" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {conversionData.map((item) => (
              <div key={item.etapa} className="flex items-center justify-between text-sm">
                <span className="text-warm-steel/70">{item.etapa}</span>
                <span className="font-semibold text-concrete">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-warm-steel/20 p-6">
          <h2 className="text-lg font-semibold text-concrete mb-4">Citas por mes (últimos 12 meses)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.citasPorMes} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#857C91' }} />
                <YAxis tick={{ fontSize: 11, fill: '#857C91' }} />
                <Tooltip
                  formatter={((value: number | undefined) => [value ?? 0, 'citas'] as const) as any}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#525871" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-warm-steel/20 p-6">
          <h2 className="text-lg font-semibold text-concrete mb-4">Ingresos recurrentes mensuales (MRR)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.ingresosPorMes} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#857C91' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#857C91' }}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  formatter={((value: number | undefined) => [`$${(value ?? 0).toFixed(2)}`, 'MRR'] as const) as any}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                />
                <Line
                  type="monotone"
                  dataKey="mrr"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ r: 5, strokeWidth: 2, fill: '#22c55e' }}
                  activeDot={{ r: 7, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-warm-steel/20 p-6 shadow-sm animate-pulse">
      <div className="h-4 bg-warm-steel/10 rounded w-3/4 mb-4" />
      <div className="h-8 bg-warm-steel/10 rounded w-1/2 mb-2" />
      <div className="h-4 bg-warm-steel/10 rounded w-1/4" />
    </div>
  );
}