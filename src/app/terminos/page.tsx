'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle, Calendar, Shield, CreditCard, XCircle, Mail, Phone } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TerminosPage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface-light">
      <Header />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-warm-steel/60 hover:text-accent transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Volver
          </Link>

          <article className="bg-white rounded-2xl border border-warm-steel/20 p-8 shadow-sm animate-slide-up">
            <header className="mb-8 pb-6 border-b border-warm-steel/20">
              <h1 className="text-3xl font-bold text-concrete mb-2">Términos y Condiciones</h1>
              <p className="text-warm-steel/60">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </header>

            <div className="space-y-8 text-warm-steel/70 leading-relaxed">
              <section>
                <h2 className="text-xl font-semibold text-concrete mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-accent" aria-hidden="true" />
                  1. Aceptación de los términos
                </h2>
                <p>Al acceder y usar ShinyBella, aceptas estos términos y condiciones. Si no estás de acuerdo, no uses nuestros servicios.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-concrete mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent" aria-hidden="true" />
                  2. Reservas y citas
                </h2>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Las reservas se confirman tras el pago exitoso mediante Stripe.</li>
                  <li>El usuario recibe un código de confirmación por email y WhatsApp.</li>
                  <li>El salón se reserva el derecho de rechazar o reprogramar citas por causas de fuerza mayor.</li>
                  <li>Los horarios mostrados son orientativos y sujetos a disponibilidad real del estilista.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-concrete mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-accent" aria-hidden="true" />
                  3. Cancelaciones y reembolsos
                </h2>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Cancelación gratis hasta 2 horas antes de la cita.</li>
                  <li>Cancelaciones con menos de 2 horas: no hay reembolso.</li>
                  <li>No-show (no presentarse): cargo completo del servicio.</li>
                  <li>Reembolsos se procesan en 5-10 días hábiles al método de pago original.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-concrete mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-accent" aria-hidden="true" />
                  4. Pagos y facturación
                </h2>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Pagos procesados de forma segura por Stripe (certificado PCI DSS Nivel 1).</li>
                  <li>ShinyBella no almacena datos de tarjetas.</li>
                  <li>Precios en USD, incluyen impuestos aplicables en El Salvador.</li>
                  <li>Factura electrónica disponible bajo solicitud.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-concrete mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" aria-hidden="true" />
                  5. Responsabilidad
                </h2>
                <ul className="space-y-2 list-disc list-inside">
                  <li>ShinyBella actúa como intermediario; la prestación del servicio es responsabilidad del salón.</li>
                  <li>No nos hacemos responsables por resultados estéticos, alergias o daños durante el servicio.</li>
                  <li>El usuario debe informar al estilista sobre alergias, condiciones médicas o embarazo.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-concrete mb-3 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-accent" aria-hidden="true" />
                  6. Comunicaciones
                </h2>
                <p>Al registrarte, aceptas recibir: confirmaciones de reserva, recordatorios 24h antes, ofertas promocionales (opcional, configurable en perfil).</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-concrete mb-3 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-accent" aria-hidden="true" />
                  7. Contacto
                </h2>
                <p>Para dudas sobre estos términos: <a href="mailto:legal@shinybella.com" className="text-accent hover:underline">legal@shinybella.com</a></p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-concrete mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-accent" aria-hidden="true" />
                  8. Ley aplicable y jurisdicción
                </h2>
                <p>Estos términos se rigen por las leyes de la República de El Salvador. Cualquier disputa se resolverá en los tribunales de San Salvador.</p>
              </section>
            </div>
          </article>
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