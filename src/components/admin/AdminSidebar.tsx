'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Building2,
  Users,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface AdminSidebarProps {
  userName?: string;
  userEmail?: string;
  onLogout: () => void;
}

const navigation = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/solicitudes', label: 'Solicitudes', icon: ClipboardList },
  { href: '/admin/negocios', label: 'Negocios', icon: Building2 },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/estadisticas', label: 'Estadísticas', icon: BarChart3 },
];

export default function AdminSidebar({ userName, userEmail, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-white border-r border-warm-steel/20 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } lg:static lg:z-auto lg:h-auto`}
      aria-label="Navegación principal"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-16 px-4 border-b border-warm-steel/20">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2" aria-label="ShinyBella Admin">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="font-bold text-concrete text-lg">Admin</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg text-warm-steel/50 hover:bg-warm-steel/10 transition-colors lg:hidden"
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            aria-expanded={!collapsed}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" role="navigation" aria-label="Menú principal">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-warm-steel/70 hover:bg-warm-steel/10 hover:text-concrete'
                } ${collapsed ? 'justify-center' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-warm-steel/20">
          {!collapsed ? (
            <div className="space-y-3">
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-concrete truncate">{userName || 'Administrador'}</p>
                <p className="text-xs text-warm-steel/50 truncate">{userEmail}</p>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" aria-hidden="true" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onLogout}
              className="w-full p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5 mx-auto" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}