'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Calendar, MapPin, Clock, User, CreditCard, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { mockSalones, mockServicios, mockEstilistas, getSalonById, getServicioById, getEstilistaById } from '@/lib/mockData';

export default function ConfirmacionPage() {
  const params = useParams();
  const paymentIntentId = params.id as string;

  const [reserva, setReserva] = useState<{
    salon: string;
    servicio: string;
    estilista: string;
    fecha: string;
    hora: string;
    precio: number;
    codigo: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('shinybella_last_reserva');
    if (stored) {
      try {
        setReserva(JSON.parse(stored));
      } catch {
        setReserva(null);
      }
    }
    setLoading(false);
  }, []);

  const formatFecha = (fechaStr: string) => {
    const date = new Date(fechaStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

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

  if (!reserva) {
    return (
      <div className="flex flex-col min-h-screen bg-surface-light">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-concrete mb-2">¡Pago confirmado!</h1>
            <p className="text-warm-steel/70 mb-6">Tu reserva ha sido procesada exitosamente. Los detalles se han enviado a tu email.</p>
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-concrete transition-colors">
              Volver al inicio <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface-light">
      <Header />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="text-center mb-10 animate-slide-up">
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-accent" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold text-concrete mb-2">¡Reserva confirmada!</h1>
            <p className="text-warm-steel/70 text-lg">Tu cita ha sido agendada y pagada exitosamente</p>
            <p className="text-warm-steel/50 text-sm mt-2">ID de transacción: <code className="bg-surface-light px-2 py-1 rounded">{paymentIntentId.slice(0, 20)}...</code></p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <article className="bg-white rounded-2xl border border-warm-steel/20 p-6 animate-slide-up">
              <h2 className="font-semibold text-concrete mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent" aria-hidden="true" />
                Detalles de la cita
              </h2>
              <dl className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-warm-steel/50 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <dd className="text-warm-steel/70">{reserva.salon}</dd>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-warm-steel/50 flex-shrink-0" aria-hidden="true" />
                  <dd className="text-warm-steel/70">{formatFecha(reserva.fecha)} a las {reserva.hora}</dd>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-warm-steel/50 flex-shrink-0" aria-hidden="true" />
                  <dd className="text-warm-steel/70">{reserva.estilista}</dd>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-warm-steel/50 flex-shrink-0" aria-hidden="true" />
                  <dd className="text-warm-steel/70">{reserva.servicio} · <span className="font-bold text-primary">${reserva.precio.toFixed(2)}</span></dd>
                </div>
              </dl>
            </article>

            <article className="bg-white rounded-2xl border border-warm-steel/20 p-6 animate-slide-up">
              <h2 className="font-semibold text-concrete mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent" aria-hidden="true" />
                Tu código de confirmación
              </h2>
              <div className="bg-surface-light rounded-xl p-6 text-center">
                <p className="text-warm-steel/60 text-sm mb-2">Presenta este código al llegar al salón</p>
                <code className="text-3xl font-mono font-bold text-concrete tracking-widest bg-white px-4 py-2 rounded-lg border border-warm-steel/20 inline-block">
                  {reserva.codigo}
                </code>
                <p className="text-warm-steel/50 text-xs mt-3">También lo recibirás por email y WhatsApp</p>
              </div>
            </article>
          </div>

          <div className="bg-primary rounded-2xl p-6 text-white animate-slide-up">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5" aria-hidden="true" />
              Próximos pasos
            </h3>
            <ul className="space-y-2 text-warm-steel/10">
              <li className="flex items-center gap-2">✓ Pago procesado y confirmado</li>
              <li className="flex items-center gap-2">✓ Cupo reservado para ti</li>
              <li className="flex items-center gap-2">✓ Recordatorio 24h antes por WhatsApp/email</li>
              <li className="flex items-center gap-2">✓ Cancelación gratis hasta 2 horas antes</li>
            </ul>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link
              href="/mis-citas"
              className="w-full sm:w-auto px-8 py-4 bg-white text-concrete font-semibold rounded-xl hover:bg-surface-light transition-colors text-center"
            >
              Ver mis citas
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors text-center"
            >
              Agendar otra cita
            </Link>
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