'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Phone, Star, Clock, ArrowLeft, Calendar, User, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ServiceCard from '@/components/ServiceCard';
import TimeSlotPicker from '@/components/TimeSlotPicker';
import { mockSalones, mockServicios, mockEstilistas, getSalonById, getServiciosBySalon, getEstilistasBySalon } from '@/lib/mockData';
import type { Salon, Servicio, Estilista } from '@/lib/types';

export default function SalonPage() {
  const params = useParams();
  const router = useRouter();
  const salonId = params.id as string;

  const [salon, setSalon] = useState<Salon | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [estilistas, setEstilistas] = useState<Estilista[]>([]);
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);
  const [selectedEstilistaId, setSelectedEstilistaId] = useState<string | null>(null);
  const [selectedFecha, setSelectedFecha] = useState<Date | null>(null);
  const [selectedHora, setSelectedHora] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSalonById(salonId);
    if (s) {
      setSalon(s);
      setServicios(getServiciosBySalon(salonId));
      setEstilistas(getEstilistasBySalon(salonId));
      if (mockEstilistas.find(e => e.salon_id === salonId)?.id) {
        setSelectedEstilistaId(mockEstilistas.find(e => e.salon_id === salonId)!.id);
      }
    } else {
      router.push('/');
    }
    setLoading(false);
  }, [salonId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" aria-hidden="true" />
      </div>
    );
  }

  if (!salon) return null;

  const handleSelectServicio = (servicio: Servicio) => {
    setSelectedServicio(servicio);
    setStep(2);
  };

  const handleSelectSlot = (estilistaId: string, fecha: Date, hora: string) => {
    setSelectedEstilistaId(estilistaId);
    setSelectedFecha(fecha);
    setSelectedHora(hora);
    setStep(3);
  };

  const handleConfirmar = () => {
    if (selectedServicio && selectedFecha && selectedHora && selectedEstilistaId) {
      const reservaData = {
        salonId: salon.id,
        servicioId: selectedServicio.id,
        estilistaId: selectedEstilistaId,
        fecha: selectedFecha.toISOString().split('T')[0],
        hora: selectedHora,
        precio: selectedServicio.precio,
      };
      localStorage.setItem('shinybella_pending_reserva', JSON.stringify(reservaData));
      router.push('/checkout');
    }
  };

  const formatFecha = (date: Date) => {
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-light">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-warm-steel/60 hover:text-accent transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Volver al mapa
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <article className="bg-white rounded-2xl border border-warm-steel/20 overflow-hidden shadow-sm">
                <div className="aspect-[16/9] bg-surface-light relative">
                  {salon.imagen_url ? (
                    <img
                      src={salon.imagen_url}
                      alt={salon.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin className="w-16 h-16 text-warm-steel/30" aria-hidden="true" />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-2xl lg:text-3xl font-bold text-concrete">{salon.nombre}</h1>
                      <div className="flex items-center gap-3 mt-2 text-warm-steel/70">
                        <MapPin className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                        <span>{salon.direccion}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 fill-current" aria-hidden="true" />
                      <span className="font-semibold">{salon.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mb-6 text-warm-steel/70">
                    <a href={`tel:${salon.telefono}`} className="flex items-center gap-2 hover:text-accent transition-colors">
                      <Phone className="w-5 h-5" aria-hidden="true" />
                      <span>{salon.telefono}</span>
                    </a>
                    <span className="flex items-center gap-2">
                      <Clock className="w-5 h-5" aria-hidden="true" />
                      <span>Lun-Sáb 8:00-20:00</span>
                    </span>
                  </div>
                </div>
              </article>

              <section className="bg-white rounded-2xl border border-warm-steel/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-concrete">Servicios disponibles</h2>
                  <span className="text-sm text-warm-steel/60">{servicios.length} servicios</span>
                </div>

                <div className="space-y-3" role="list" aria-label="Lista de servicios">
                  {servicios.map((servicio) => (
                    <ServiceCard
                      key={servicio.id}
                      servicio={servicio}
                      isSelected={selectedServicio?.id === servicio.id}
                      onClick={() => handleSelectServicio(servicio)}
                    />
                  ))}
                </div>
              </section>

              {selectedServicio && (
                <section className="bg-white rounded-2xl border border-warm-steel/20 p-6 animate-slide-up">
                  <h2 className="text-xl font-bold text-concrete mb-6">Elige tu estilista, fecha y hora</h2>
                  <TimeSlotPicker
                    estilistas={estilistas}
                    onSelect={handleSelectSlot}
                    selectedEstilistaId={selectedEstilistaId}
                    selectedFecha={selectedFecha}
                    selectedHora={selectedHora}
                  />
                </section>
              )}

              {selectedFecha && selectedHora && selectedEstilistaId && selectedServicio && (
                <section className="bg-white rounded-2xl border border-warm-steel/20 p-6 animate-slide-up">
                  <h2 className="text-xl font-bold text-concrete mb-6">Resumen de tu reserva</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-surface-light rounded-xl">
                      <div>
                        <p className="font-medium text-concrete">{selectedServicio.nombre}</p>
                        <p className="text-warm-steel/60 text-sm">
                          Con {estilistas.find(e => e.id === selectedEstilistaId)?.nombre}
                        </p>
                      </div>
                      <span className="font-bold text-xl text-primary">${selectedServicio.precio.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-accent/5 border border-accent/20 rounded-xl">
                      <Calendar className="w-6 h-6 text-accent" aria-hidden="true" />
                      <div>
                        <p className="font-medium text-concrete">
                          {formatFecha(selectedFecha)} a las {selectedHora}
                        </p>
                        <p className="text-warm-steel/60 text-sm">{salon.nombre} · {salon.direccion}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-warm-steel/20">
                      <span className="text-warm-steel/70">Total a pagar</span>
                      <span className="text-2xl font-bold text-primary">${selectedServicio.precio.toFixed(2)}</span>
                    </div>

                    <button
                      onClick={handleConfirmar}
                      className="w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-concrete transition-colors text-lg flex items-center justify-center gap-2"
                    >
                      Continuar al pago
                      <ChevronRight className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>
                </section>
              )}
            </div>

            <aside className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-warm-steel/20 p-6 sticky top-24 space-y-6">
                <div>
                  <h3 className="font-semibold text-concrete mb-4">Información del salón</h3>
                  <dl className="space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-warm-steel/50 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <dd className="text-warm-steel/70">{salon.direccion}</dd>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-warm-steel/50 flex-shrink-0" aria-hidden="true" />
                      <dd className="text-warm-steel/70">
                        <a href={`tel:${salon.telefono}`} className="hover:text-accent transition-colors">
                          {salon.telefono}
                        </a>
                      </dd>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-warm-steel/50 flex-shrink-0" aria-hidden="true" />
                      <dd className="text-warm-steel/70">Lunes a Sábado: 8:00 - 20:00</dd>
                    </div>
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-amber-500 fill-current flex-shrink-0" aria-hidden="true" />
                      <dd className="text-warm-steel/70">{salon.rating.toFixed(1)} / 5.0 ({servicios.length} servicios)</dd>
                    </div>
                  </dl>
                </div>

                <div className="p-4 bg-surface-light rounded-xl">
                  <h4 className="font-medium text-concrete mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-accent" aria-hidden="true" />
                    Importante
                  </h4>
                  <ul className="text-sm text-warm-steel/70 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" aria-hidden="true" />
                      Pago seguro con tarjeta (Stripe)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" aria-hidden="true" />
                      Cancelación gratis hasta 2h antes
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" aria-hidden="true" />
                      Recibirás confirmación por email/WhatsApp
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" aria-hidden="true" />
                      Presenta tu código QR al llegar
                    </li>
                  </ul>
                </div>

                <Link
                  href="/"
                  className="w-full text-center px-4 py-3 text-sm font-medium text-accent bg-accent/5 rounded-lg hover:bg-accent/10 transition-colors block"
                >
                  ← Buscar otro salón
                </Link>
              </div>
            </aside>
          </div>
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