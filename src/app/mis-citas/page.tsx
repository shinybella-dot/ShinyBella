'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient';
import { Calendar, MapPin, Clock, User, CreditCard, XCircle, CheckCircle, Loader2, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Reserva } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MisCitasPage() {
  const supabase = createClient();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservas = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('reservas')
        .select('*, salon: salones(*), servicio: servicios(*), estilista: estilistas(*)')
        .eq('user_id', user.id)
        .order('fecha', { ascending: true });

      if (data) setReservas(data as Reserva[]);
      setLoading(false);
    };

    fetchReservas();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchReservas();
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleCancel = async (reservaId: string) => {
    if (!confirm('¿Seguro que quieres cancelar esta cita?')) return;

    setCancellingId(reservaId);
    const { error } = await supabase
      .from('reservas')
      .update({ estado: 'cancelada' })
      .eq('id', reservaId);

    if (!error) {
      setReservas(prev => prev.map(r => r.id === reservaId ? { ...r, estado: 'cancelada' } : r));
    }
    setCancellingId(null);
  };

  const formatFecha = (fechaStr: string) => {
    return format(parseISO(fechaStr), 'EEEE d MMMM yyyy', { locale: es });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'confirmada': return 'bg-green-100 text-green-800';
      case 'pendiente': return 'bg-amber-100 text-amber-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      case 'completada': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'confirmada': return 'Confirmada';
      case 'pendiente': return 'Pendiente';
      case 'cancelada': return 'Cancelada';
      case 'completada': return 'Completada';
      default: return estado;
    }
  };

  const upcoming = reservas.filter(r => r.estado !== 'cancelada' && r.estado !== 'completada');
  const past = reservas.filter(r => r.estado === 'completada' || r.estado === 'cancelada');

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-surface-light">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface-light">
      <Header />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-concrete">Mis citas</h1>
              <p className="text-warm-steel/60 mt-1">Gestiona tus reservas próximas y pasadas</p>
            </div>
            <Link
              href="/"
              className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-concrete transition-colors flex items-center gap-2"
            >
              <Calendar className="w-5 h-5" aria-hidden="true" />
              Nueva cita
            </Link>
          </div>

          {upcoming.length > 0 && (
            <section className="mb-12 animate-slide-up">
              <h2 className="text-lg font-semibold text-concrete mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent" aria-hidden="true" />
                Próximas citas ({upcoming.length})
              </h2>
              <div className="space-y-4">
                {upcoming.map((reserva) => (
                  <article key={reserva.id} className="bg-white rounded-2xl border border-warm-steel/20 p-6 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-surface-light flex items-center justify-center flex-shrink-0">
                          {reserva.salon?.imagen_url ? (
                            <img src={reserva.salon.imagen_url} alt="" className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <MapPin className="w-8 h-8 text-warm-steel/30" aria-hidden="true" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-concrete text-lg">{reserva.salon?.nombre}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(reserva.estado)}`}>
                              {getEstadoLabel(reserva.estado)}
                            </span>
                          </div>
                          <p className="text-warm-steel/70 text-sm mb-1">{reserva.salon?.direccion}</p>
                          <div className="flex flex-wrap items-center gap-4 text-warm-steel/60 text-sm">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" aria-hidden="true" />
                              {reserva.estilista?.nombre}
                            </span>
                            <span className="flex items-center gap-1">
                              <CreditCard className="w-4 h-4" aria-hidden="true" />
                              {reserva.servicio?.nombre}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 lg:ml-8">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">${reserva.servicio?.precio.toFixed(2)}</p>
                          <p className="text-warm-steel/60 text-sm">{formatFecha(reserva.fecha)}</p>
                          <p className="text-warm-steel/60 text-sm">{reserva.hora}</p>
                        </div>
                        <div className="flex gap-2">
                          {reserva.estado === 'confirmada' && (
                            <button
                              onClick={() => handleCancel(reserva.id)}
                              disabled={cancellingId === reserva.id}
                              className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors text-sm disabled:opacity-50 flex items-center gap-1"
                            >
                              {cancellingId === reserva.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4" aria-hidden="true" />
                                  Cancelar
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section className="animate-slide-up">
              <h2 className="text-lg font-semibold text-concrete mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-warm-steel/50" aria-hidden="true" />
                Historial ({past.length})
              </h2>
              <div className="space-y-3">
                {past.map((reserva) => (
                  <article key={reserva.id} className="bg-white rounded-xl border border-warm-steel/20 p-4 opacity-70">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-surface-light flex items-center justify-center flex-shrink-0">
                          {reserva.salon?.imagen_url ? (
                            <img src={reserva.salon.imagen_url} alt="" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <MapPin className="w-6 h-6 text-warm-steel/30" aria-hidden="true" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-concrete">{reserva.salon?.nombre}</p>
                          <p className="text-warm-steel/60 text-sm">{reserva.servicio?.nombre} · {reserva.estilista?.nombre}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(reserva.estado)}`}>
                          {getEstadoLabel(reserva.estado)}
                        </span>
                        <span className="text-warm-steel/60">{formatFecha(reserva.fecha)} · {reserva.hora}</span>
                        <span className="font-semibold text-concrete">${reserva.servicio?.precio.toFixed(2)}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {reservas.length === 0 && (
            <div className="text-center py-16 animate-slide-up">
              <Calendar className="w-16 h-16 text-warm-steel/20 mx-auto mb-4" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-concrete mb-2">No tienes citas aún</h2>
              <p className="text-warm-steel/60 mb-6">Cuando reserves, aparecerán aquí tus próximas citas e historial</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-concrete transition-colors"
              >
                Buscar salón <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <style jsx>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
}