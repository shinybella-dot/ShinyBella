'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Building2, ToggleLeft, ToggleRight, Eye, MoreHorizontal } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';

interface Salon {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  rating: number;
  activo: boolean;
  estado_verificacion: 'pendiente' | 'aprobada' | 'rechazada' | 'suspendida';
  owner_id: string | null;
  created_at: string;
}

const estadoLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' }> = {
  pendiente: { label: 'Pendiente', variant: 'warning' },
  aprobada: { label: 'Aprobada', variant: 'success' },
  rechazada: { label: 'Rechazada', variant: 'destructive' },
  suspendida: { label: 'Suspendida', variant: 'secondary' },
};

export default function AdminNegociosPage() {
  const [salones, setSalones] = useState<Salon[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<string | null>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSalones = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sort: sortColumn || 'created_at',
        order: sortDirection,
      });
      if (filters.estado) params.set('estado', filters.estado);
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/negocios?${params.toString()}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSalones(data.salones);
      setTotal(data.total);
    } catch (err) {
      console.error('Error fetching salones:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortColumn, sortDirection, filters, search]);

  useEffect(() => {
    fetchSalones();
  }, [fetchSalones]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleToggleActivo = async (salon: Salon) => {
    setActionLoading(salon.id);
    try {
      const res = await fetch(`/api/admin/negocios/${salon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !salon.activo }),
      });
      if (!res.ok) throw new Error('Error al actualizar');
      fetchSalones();
    } catch (err) {
      console.error('Error toggle activo:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    {
      key: 'nombre',
      header: 'Salón',
      sortable: true,
      filterable: true,
      render: (row: Salon) => (
        <div>
          <p className="font-medium text-concrete">{row.nombre}</p>
          <p className="text-xs text-warm-steel/50">{row.direccion.slice(0, 50)}{row.direccion.length > 50 ? '...' : ''}</p>
        </div>
      ),
    },
    {
      key: 'telefono',
      header: 'Teléfono',
      sortable: false,
      filterable: true,
      render: (row: Salon) => (
        <a href={`tel:${row.telefono}`} className="text-warm-steel/70 hover:text-accent">{row.telefono}</a>
      ),
    },
    {
      key: 'estado_verificacion',
      header: 'Verificación',
      sortable: true,
      filterable: true,
      render: (row: Salon) => {
        const estado = estadoLabels[row.estado_verificacion];
        return <Badge variant={estado.variant}>{estado.label}</Badge>;
      },
    },
    {
      key: 'activo',
      header: 'Estado',
      sortable: true,
      filterable: true,
      render: (row: Salon) => (
        <button
          onClick={() => handleToggleActivo(row)}
          disabled={actionLoading === row.id}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            row.activo ? 'bg-accent' : 'bg-warm-steel/20'
          } ${actionLoading === row.id ? 'opacity-50 cursor-not-allowed' : ''}`}
          role="switch"
          aria-checked={row.activo}
          aria-label={row.activo ? 'Desactivar salón' : 'Activar salón'}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              row.activo ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      sortable: true,
      filterable: false,
      render: (row: Salon) => (
        <span className="font-medium text-concrete">{row.rating.toFixed(1)} / 5.0</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Creado',
      sortable: true,
      filterable: false,
      render: (row: Salon) => (
        <span className="text-warm-steel/70 whitespace-nowrap">
          {new Date(row.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
  ];

  const rowActions = [
    {
      label: 'Ver público',
      icon: <Eye className="w-4 h-4" />,
      onClick: (row: Salon) => window.open(`/salon/${row.id}`, '_blank'),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-concrete">Negocios / Salones</h1>
          <p className="text-warm-steel/60 mt-1">Gestiona los salones registrados en la plataforma</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-steel/40" />
            <input
              type="text"
              placeholder="Buscar por nombre, dirección..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-warm-steel/20 rounded-xl text-sm text-concrete placeholder-warm-steel/40 focus:outline-none focus:ring-2 focus:ring-accent/50 w-64"
            />
          </div>
          <select
            value={filters.estado || 'todos'}
            onChange={(e) => handleFilterChange('estado', e.target.value)}
            className="px-3 py-2 bg-white border border-warm-steel/20 rounded-xl text-sm text-concrete focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <option value="todos">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobada">Aprobada</option>
            <option value="rechazada">Rechazada</option>
            <option value="suspendida">Suspendida</option>
          </select>
        </div>
      </div>

      <DataTable<Salon>
        columns={columns}
        data={salones}
        keyExtractor={(row) => row.id}
        loading={loading}
        emptyMessage="No se encontraron salones"
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
        sorting={{
          column: sortColumn,
          direction: sortDirection,
          onSort: handleSort,
        }}
        filtering={{
          filters,
          onFilterChange: handleFilterChange,
        }}
        rowActions={rowActions}
      />
    </div>
  );
}