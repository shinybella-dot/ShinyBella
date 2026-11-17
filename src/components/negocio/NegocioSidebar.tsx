'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Image,
  Scissors,
  Users,
  CalendarClock,
  Calendar,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import * as React from 'react';

interface NegocioSidebarProps {
  salonName?: string;
  onLogout: () => void;
}

interface NegocioTabContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const NegocioTabContext = React.createContext<NegocioTabContextValue | null>(null);

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'perfil', label: 'Mi salón', icon: Building2 },
  { id: 'imagenes', label: 'Imágenes', icon: Image },
  { id: 'servicios', label: 'Servicios', icon: Scissors },
  { id: 'estilistas', label: 'Estilistas', icon: Users },
  { id: 'horarios', label: 'Horarios', icon: CalendarClock },
  { id: 'reservas', label: 'Reservas', icon: Calendar },
  { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
];

export function NegocioTabProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const value = React.useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);

  return <NegocioTabContext.Provider value={value}>{children}</NegocioTabContext.Provider>;
}

export function useNegocioTab(): NegocioTabContextValue {
  const context = React.useContext(NegocioTabContext);
  if (!context) throw new Error('useNegocioTab debe usarse dentro de NegocioTabProvider');
  return context;
}

export default function NegocioSidebar({ salonName, onLogout }: NegocioSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { activeTab, setActiveTab } = useNegocioTab();
  const [collapsed, setCollapsed] = React.useState(false);

  const handleSelect = (tab: string) => {
    setActiveTab(tab);
    if (pathname !== '/negocio/dashboard') {
      router.push('/negocio/dashboard');
    }
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-white border-r border-warm-steel/20 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } lg:static lg:z-auto lg:h-auto`}
      aria-label="Navegación negocio"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-16 px-4 border-b border-warm-steel/20">
          {!collapsed && (
            <button
              type="button"
              onClick={() => handleSelect('dashboard')}
              className="flex items-center gap-2"
              aria-label="Ir al panel de mi salón"
            >
              <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                <Scissors className="w-5 h-5 text-accent" aria-hidden="true" />
              </div>
              <span className="font-bold text-concrete text-lg">Mi Salón</span>
            </button>
          )}
          <button
            type="button"
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
            const isActive = pathname === '/negocio/dashboard' && activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-warm-steel/70 hover:bg-warm-steel/10 hover:text-concrete'
                } ${collapsed ? 'justify-center' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-warm-steel/20">
          {!collapsed ? (
            <div className="space-y-3">
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-concrete truncate">{salonName || 'Mi Salón'}</p>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" aria-hidden="true" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
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
