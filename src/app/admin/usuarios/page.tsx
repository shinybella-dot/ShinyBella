'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, User, UserPlus, Shield, Ban, MoreHorizontal, Edit2 } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

interface UserProfile {
  id: string;
  email: string;
  nombre: string | null;
  telefono: string | null;
  rol: 'cliente' | 'negocio' | 'admin';
  creado_en: string;
  last_sign_in_at: string | null;
}

const rolLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' }> = {
  cliente: { label: 'Cliente', variant: 'default' },
  negocio: { label: 'Negocio', variant: 'warning' },
  admin: { label: 'Admin', variant: 'destructive' },
};

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<UserProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<string | null>('creado_en');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rolModalOpen, setRolModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newRol, setNewRol] = useState<'cliente' | 'negocio' | 'admin'>('cliente');

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sort: sortColumn || 'creado_en',
        order: sortDirection,
      });
      if (filters.rol) params.set('rol', filters.rol);
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/usuarios?${params.toString()}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setUsuarios(data.usuarios);
      setTotal(data.total);
    } catch (err) {
      console.error('Error fetching usuarios:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortColumn, sortDirection, filters, search]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

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

  const handleRolChange = async (user: UserProfile) => {
    setSelectedUser(user);
    setNewRol(user.rol);
    setRolModalOpen(true);
  };

  const handleConfirmRolChange = async () => {
    if (!selectedUser || newRol === selectedUser.rol) {
      setRolModalOpen(false);
      return;
    }
    setActionLoading(selectedUser.id);
    try {
      const res = await fetch(`/api/admin/usuarios/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol: newRol }),
      });
      if (!res.ok) throw new Error('Error al cambiar rol');
      fetchUsuarios();
      setRolModalOpen(false);
    } catch (err) {
      console.error('Error cambiar rol:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanear = async (user: UserProfile) => {
    if (!confirm(`¿Banear a ${user.email}? Esta acción no se puede deshacer fácilmente.`)) return;
    setActionLoading(user.id);
    try {
      const res = await fetch(`/api/admin/usuarios/${user.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al banear');
      fetchUsuarios();
    } catch (err) {
      console.error('Error banear:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      filterable: true,
      render: (row: UserProfile) => (
        <p className="font-medium text-concrete">{row.email}</p>
      ),
    },
    {
      key: 'nombre',
      header: 'Nombre',
      sortable: true,
      filterable: true,
      render: (row: UserProfile) => (
        <p className="text-concrete">{row.nombre || '—'}</p>
      ),
    },
    {
      key: 'rol',
      header: 'Rol',
      sortable: true,
      filterable: true,
      render: (row: UserProfile) => {
        const rol = rolLabels[row.rol];
        return <Badge variant={rol.variant}>{rol.label}</Badge>;
      },
    },
    {
      key: 'creado_en',
      header: 'Registrado',
      sortable: true,
      filterable: false,
      render: (row: UserProfile) => (
        <span className="text-warm-steel/70 whitespace-nowrap">
          {new Date(row.creado_en).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'last_sign_in_at',
      header: 'Último acceso',
      sortable: true,
      filterable: false,
      render: (row: UserProfile) => (
        <span className="text-warm-steel/70 whitespace-nowrap">
          {row.last_sign_in_at
            ? new Date(row.last_sign_in_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            : 'Nunca'}
        </span>
      ),
    },
  ];

  const rowActions = [
    {
      label: 'Cambiar rol',
      icon: <Edit2 className="w-4 h-4" />,
      onClick: handleRolChange,
    },
    {
      label: 'Banear',
      icon: <Ban className="w-4 h-4" />,
      variant: 'danger' as const,
      onClick: handleBanear,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-concrete">Usuarios</h1>
          <p className="text-warm-steel/60 mt-1">Gestiona los usuarios de la plataforma</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-steel/40" />
            <input
              type="text"
              placeholder="Buscar por email, nombre..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-warm-steel/20 rounded-xl text-sm text-concrete placeholder-warm-steel/40 focus:outline-none focus:ring-2 focus:ring-accent/50 w-64"
            />
          </div>
          <select
            value={filters.rol || 'todos'}
            onChange={(e) => handleFilterChange('rol', e.target.value)}
            className="px-3 py-2 bg-white border border-warm-steel/20 rounded-xl text-sm text-concrete focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <option value="todos">Todos los roles</option>
            <option value="cliente">Cliente</option>
            <option value="negocio">Negocio</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <DataTable<UserProfile>
        columns={columns}
        data={usuarios}
        keyExtractor={(row) => row.id}
        loading={loading}
        emptyMessage="No se encontraron usuarios"
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

      <Modal
        isOpen={rolModalOpen}
        onClose={() => { setRolModalOpen(false); setSelectedUser(null); }}
        title="Cambiar rol"
        size="sm"
      >
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-warm-steel/70">
              Cambiar rol de <strong>{selectedUser.email}</strong> ({selectedUser.nombre || 'Sin nombre'})
            </p>
            <div>
              <label className="block text-sm font-medium text-concrete mb-2">Nuevo rol</label>
              <select
                value={newRol}
                onChange={(e) => setNewRol(e.target.value as 'cliente' | 'negocio' | 'admin')}
                className="w-full px-3 py-2 bg-white border border-warm-steel/20 rounded-xl text-sm text-concrete focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="cliente">Cliente</option>
                <option value="negocio">Negocio</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-warm-steel/20">
              <button
                onClick={() => { setRolModalOpen(false); setSelectedUser(null); }}
                disabled={actionLoading === selectedUser.id}
                className="px-4 py-2 rounded-lg border border-warm-steel/20 text-warm-steel/70 hover:bg-warm-steel/10"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmRolChange}
                disabled={actionLoading === selectedUser.id || newRol === selectedUser.rol}
                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-concrete"
              >
                {actionLoading === selectedUser.id ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}