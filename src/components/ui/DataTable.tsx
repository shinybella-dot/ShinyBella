'use client';

import { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  MoreHorizontal,
} from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  sorting?: {
    column: string | null;
    direction: 'asc' | 'desc';
    onSort: (column: string) => void;
  };
  filtering?: {
    filters: Record<string, string>;
    onFilterChange: (key: string, value: string) => void;
  };
  rowActions?: {
    label: string;
    onClick: (row: T) => void;
    variant?: 'default' | 'danger';
    icon?: React.ReactNode;
  }[];
}

function SortIcon({ column, sorting }: { column: string; sorting?: DataTableProps<any>['sorting'] }) {
  if (sorting?.column !== column) return <span className="w-4 h-4 text-warm-steel/20" />;
  return sorting.direction === 'asc' ? (
    <ChevronUp className="w-4 h-4 text-accent" />
  ) : (
    <ChevronDown className="w-4 h-4 text-accent" />
  );
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  pagination,
  sorting,
  filtering,
  rowActions,
}: DataTableProps<T>) {
  const [showFilters, setShowFilters] = useState(false);

  const sortedData = useMemo(() => {
    if (!sorting?.column) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sorting.column!] as string | number | undefined;
      const bVal = (b as Record<string, unknown>)[sorting.column!] as string | number | undefined;
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sorting.direction === 'asc' ? -1 : 1;
      if (bVal == null) return sorting.direction === 'asc' ? 1 : -1;
      if (aVal < bVal) return sorting.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sorting.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sorting]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-warm-steel/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" role="grid">
            <thead>
              <tr className="border-b border-warm-steel/20">
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 text-left">
                    <div className="h-4 bg-warm-steel/10 rounded w-3/4 animate-pulse" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-warm-steel/10">
                  {columns.map(() => (
                    <td key={Math.random()} className="px-4 py-3">
                      <div className="h-4 bg-warm-steel/10 rounded w-1/2 animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (sortedData.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-warm-steel/20 p-12 text-center">
        <Filter className="w-12 h-12 text-warm-steel/30 mx-auto mb-3" aria-hidden="true" />
        <p className="text-warm-steel/60">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-warm-steel/20 overflow-hidden">
      {(filtering && Object.keys(filtering.filters).length > 0) || showFilters ? (
        <div className="p-4 border-b border-warm-steel/20 bg-warm-steel/5">
          <div className="flex flex-wrap gap-3 items-end">
            {columns
              .filter((c) => c.filterable)
              .map((col) => (
                <div key={col.key} className="flex-1 min-w-[150px]">
                  <label htmlFor={`filter-${col.key}`} className="block text-xs font-medium text-warm-steel/60 mb-1">
                    {col.header}
                  </label>
                  <input
                    id={`filter-${col.key}`}
                    type="text"
                    value={filtering?.filters[col.key] || ''}
                    onChange={(e) => filtering?.onFilterChange(col.key, e.target.value)}
                    placeholder={`Filtrar ${col.header.toLowerCase()}`}
                    className="w-full px-3 py-2 bg-white border border-warm-steel/20 rounded-lg text-sm text-concrete placeholder-warm-steel/40 focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
              ))}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 text-sm font-medium text-warm-steel/70 hover:text-accent"
            >
              {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 border-b border-warm-steel/20 flex items-center justify-between">
          <h3 className="font-semibold text-concrete">Resultados: {pagination?.total || sortedData.length}</h3>
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-warm-steel/60 hover:text-accent"
          >
            <Filter className="w-4 h-4" aria-hidden="true" />
            Filtros
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full" role="grid">
          <thead>
            <tr className="border-b border-warm-steel/20 bg-warm-steel/5">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-sm font-medium text-warm-steel/60 ${col.className || ''} ${
                    col.sortable ? 'cursor-pointer hover:text-concrete select-none' : ''
                  }`}
                  onClick={() => col.sortable && sorting?.onSort(col.key)}
                  style={{ width: col.className?.includes('w-') ? undefined : undefined }}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && <SortIcon column={col.key} sorting={sorting} />}
                  </div>
                </th>
              ))}
              {rowActions && rowActions.length > 0 && (
                <th className="px-4 py-3 text-right text-sm font-medium text-warm-steel/60 w-32">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr key={keyExtractor(row)} className="border-b border-warm-steel/10 hover:bg-warm-steel/5 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 text-sm text-concrete ${col.className || ''}`}>
                    {col.render ? col.render(row, index) : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
                {rowActions && rowActions.length > 0 && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {rowActions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => action.onClick(row)}
                          className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                            action.variant === 'danger'
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-warm-steel/60 hover:bg-warm-steel/10 hover:text-concrete'
                          }`}
                          aria-label={action.label}
                        >
                          {action.icon}
                          <span className="hidden sm:inline">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.total > pagination.pageSize && (
        <div className="px-4 py-3 border-t border-warm-steel/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-warm-steel/60">
              Mostrando {(pagination.page - 1) * pagination.pageSize + 1} a{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total}
            </span>
            <select
              value={pagination.pageSize}
              onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-warm-steel/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <option value={10}>10 por página</option>
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border border-warm-steel/20 hover:bg-warm-steel/10 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4 text-warm-steel/60" />
            </button>
            <span className="px-3 text-sm font-medium text-concrete">
              Página {pagination.page} de {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              className="p-2 rounded-lg border border-warm-steel/20 hover:bg-warm-steel/10 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Página siguiente"
            >
              <ChevronRight className="w-4 h-4 text-warm-steel/60" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}