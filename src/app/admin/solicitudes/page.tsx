'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Download, ChevronUp, ChevronDown } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import SolicitudDetalleModal from '@/components/admin/SolicitudDetalleModal';
import Badge from '@/components/ui/Badge';
import { ClipboardList, Eye, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';

interface Solicitud {
  id: string;
  folio: string;
  estado: 'pendiente' | 'en_revision' | 'aprobada' | 'rechazada';
  salon_id: string;
  datos_negocio: {
    nombreSalon: string;
    tipo: string;
    direccion: string;
    telefono: string;
    email: string;
    descripcion?: string;
  };
  datos_responsable: {
    responsable: string;
    dui_nit: string;
    cargo: string;
    email: string;
    telefono: string;
  };
  documentos: {
    dui_url?: string;
    patente_url?: string;
    selfie_url?: string;
  };
  admin_notas?: string;
  creado_en: string;
  revisado_en?: string;
  salones?: {
    id: string;
    nombre: string;
    activo: boolean;
    estado_verificacion: string;
  };
}

const estadoLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' }> = {
  pendiente: { label: 'Pendiente', variant: 'warning' },
  en_revision: { label: 'En revisión', variant: 'default' },
  aprobada: { label: 'Aprobada', variant: 'success' },
  rechazada: { label: 'Rechazada', variant: 'destructive' },
};

export default function AdminSolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<string | null>('creado_en');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSolicitudes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sort: sortColumn || 'creado_en',
        order: sortDirection,
      });
      if (filters.estado) params.set('estado', filters.estado);
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/solicitudes?${params.toString()}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSolicitudes(data.solicitudes);
      setTotal(data.total);
    } catch (err) {
      console.error('Error fetching solicitudes:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortColumn, sortDirection, filters, search]);

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

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

  const handleAprobar = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/solicitudes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'aprobar', solicitudId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchSolicitudes();
      setModalOpen(false);
    } catch (err) {
      console.error('Error aprobar:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRechazar = async (id: string, motivo: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/solicitudes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rechazar', solicitudId: id, motivo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchSolicitudes();
      setModalOpen(false);
    } catch (err) {
      console.error('Error rechazar:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      key: 'folio',
      header: 'Folio',
      sortable: true,
      filterable: true,
      render: (row: Solicitud) => (
        <span className="font-mono font-medium text-concrete">{row.folio || `AF-${row.id.slice(-8)}`}</span>
      ),
    },
    {
      key: 'datos_negocio.nombreSalon',
      header: 'Salón',
      sortable: true,
      filterable: true,
      render: (row: Solicitud) => (
        <div>
          <p className="font-medium text-concrete">{row.datos_negocio.nombreSalon}</p>
          <p className="text-xs text-warm-steel/50">{row.datos_negocio.tipo}</p>
        </div>
      ),
    },
    {
      key: 'datos_responsable.responsable',
      header: 'Responsable',
      sortable: true,
      filterable: true,
      render: (row: Solicitud) => (
        <div>
          <p className="font-medium text-concrete">{row.datos_responsable.responsable}</p>
          <p className="text-xs text-warm-steel/50">{row.datos_responsable.email}</p>
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      filterable: true,
      render: (row: Solicitud) => {
        const estado = estadoLabels[row.estado];
        return <Badge variant={estado.variant}>{estado.label}</Badge>;
      },
    },
    {
      key: 'creado_en',
      header: 'Fecha',
      sortable: true,
      filterable: false,
      render: (row: Solicitud) => (
        <span className="text-warm-steel/70 whitespace-nowrap">
          {new Date(row.creado_en).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
  ];

  const rowActions = [
    {
      label: 'Ver detalle',
      icon: <Eye className="w-4 h-4" />,
      onClick: (row: Solicitud) => {
        setSelectedSolicitud(row);
        setModalOpen(true);
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-concrete">Solicitudes de afiliación</h1>
          <p className="text-warm-steel/60 mt-1">Gestiona y revisa las solicitudes de nuevos salones</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-steel/40" />
            <input
              type="text"
              placeholder="Buscar por nombre, responsable, email..."
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
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_revision">En revisión</option>
            <option value="aprobada">Aprobada</option>
            <option value="rechazada">Rechazada</option>
          </select>
        </div>
      </div>

      <DataTable<Solicitud>
        columns={columns}
        data={solicitudes}
        keyExtractor={(row) => row.id}
        loading={loading}
        emptyMessage="No se encontraron solicitudes"
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

      <SolicitudDetalleModal
        solicitud={selectedSolicitud}
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedSolicitud(null); }}
        onAprobar={handleAprobar}
        onRechazar={handleRechazar}
        loading={actionLoading}
      />
    </div>
  );
}