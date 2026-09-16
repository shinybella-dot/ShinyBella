'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MapPin, Star, Clock, CreditCard, Shield, CheckCircle, ArrowRight, MapPin as MapPinIcon, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SalonCard from '@/components/SalonCard';
import { mockSalones, type Salon } from '@/lib/mockData';

const MapaSalones = dynamic(() => import('@/components/MapaSalones'), { ssr: false });

const features = [
  {
    icon: MapPinIcon,
    title: 'Encuentra salones cerca',
    description: 'Mapa interactivo con todos los salones y barberías de Santa Ana. Filtra por distancia, rating y servicios.',
  },
  {
    icon: Clock,
    title: 'Agenda en segundos',
    description: 'Elige fecha, hora y estilista según disponibilidad real. Sin llamadas, sin esperas, sin confusiones.',
  },
  {
    icon: CreditCard,
    title: 'Paga seguro online',
    description: 'Reserva tu cita pagando con tarjeta. Tu cupo queda garantizado al instante. Stripe protege tus datos.',
  },
  {
    icon: Shield,
    title: 'Recordatorios automáticos',
    description: 'Recibe notificaciones antes de tu cita. Reduce olvidos y llega a tiempo. Tu tiempo vale oro.',
  },
];

const steps = [
  { number: '01', title: 'Busca', description: 'Abre el mapa y encuentra salones cerca de ti con ratings y fotos.' },
  { number: '02', title: 'Elige', description: 'Mira servicios, precios, horarios y estilistas. Compara y decide.' },
  { number: '03', title: 'Reserva', description: 'Selecciona fecha y hora. Paga con tarjeta y listo.' },
  { number: '04', title: 'Disfruta', description: 'Recibe confirmación y recordatorios. Solo presenta tu código QR.' },
];

export default function HomePage() {
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => {}
      );
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 flex flex-col lg:flex-row">
        <aside
          id="salones"
          className={`lg:w-96 flex-shrink-0 border-r border-warm-steel/20 bg-white transition-transform duration-300 fixed inset-y-0 left-0 z-40 lg:relative lg:static transform ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-label="Lista de salones"
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-warm-steel/20 flex items-center justify-between lg:hidden">
              <h2 className="font-semibold text-concrete">Salones cercanos</h2>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-surface transition-colors"
                aria-label="Cerrar lista"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-4 border-b border-warm-steel/20 hidden lg:block">
              <h2 className="font-semibold text-concrete mb-3">Salones en Santa Ana</h2>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-steel/40" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Buscar salón, servicio..."
                  className="w-full pl-10 pr-4 py-2 bg-surface-light border border-warm-steel/20 rounded-lg text-sm text-concrete placeholder-warm-steel/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent"
                  aria-label="Buscar salones"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3" role="list" aria-label="Lista de salones disponibles">
              {mockSalones.map((salon) => (
                <SalonCard
                  key={salon.id}
                  salon={salon}
                  isSelected={selectedSalon?.id === salon.id}
                  onClick={() => {
                    setSelectedSalon(salon);
                    setIsMobileSidebarOpen(false);
                  }}
                />
              ))}
            </div>

            <div className="p-4 border-t border-warm-steel/20 hidden lg:block">
              <Link
                href="/salones"
                className="w-full text-center px-4 py-3 text-sm font-medium text-accent bg-accent/5 rounded-lg hover:bg-accent/10 transition-colors"
              >
                Ver todos los salones <ArrowRight className="w-4 h-4 inline-block ml-1" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <section className="relative lg:hidden">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="absolute top-4 left-4 z-20 p-2 bg-white rounded-lg shadow-lg border border-warm-steel/20"
              aria-label="Abrir lista de salones"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <Suspense fallback={<div className="h-[50vh] w-full bg-surface-light flex items-center justify-center"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" aria-hidden="true" /></div>}>
              <MapaSalones
                salones={mockSalones}
                selectedSalon={selectedSalon}
                onSelectSalon={setSelectedSalon}
                userLocation={userLocation}
                className="h-[50vh] w-full"
              />
            </Suspense>
          </section>

          <section className="hidden lg:block relative h-[calc(100vh-4rem)]">
            <Suspense fallback={<div className="h-full w-full bg-surface-light flex items-center justify-center"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" aria-hidden="true" /></div>}>
              <MapaSalones
                salones={mockSalones}
                selectedSalon={selectedSalon}
                onSelectSalon={setSelectedSalon}
                userLocation={userLocation}
                className="h-full w-full"
              />
            </Suspense>

            {selectedSalon && (
              <div className="absolute bottom-4 right-4 lg:bottom-8 lg:right-8 z-20 animate-slide-up">
                <Link
                  href={`/salon/${selectedSalon.id}`}
                  className="bg-primary text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:bg-concrete transition-colors flex items-center gap-2"
                >
                  Ver detalles y reservar
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </Link>
              </div>
            )}
          </section>

          <section id="como-funciona" className="py-16 lg:py-24 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-sm font-medium rounded-full mb-4">
                  Cómo funciona
                </span>
                <h2 className="text-3xl lg:text-4xl font-bold text-concrete mb-4">
                  Tu cita de belleza en <span className="text-accent">4 pasos simples</span>
                </h2>
                <p className="text-warm-steel/70 text-lg max-w-2xl mx-auto">
                  Olvida las llamadas perdidas y los chats eternos. Con ShinyBella, agendar es tan fácil como pedir un delivery.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {steps.map((step, index) => (
                  <div
                    key={step.number}
                    className="relative p-6 bg-white rounded-2xl border border-warm-steel/20 hover:border-accent/50 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="absolute -top-3 left-6 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {step.number}
                    </div>
                    <div className="pt-6">
                      <h3 className="font-semibold text-concrete text-lg mb-2">{step.title}</h3>
                      <p className="text-warm-steel/60 text-sm">{step.description}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-0 right-0 w-1/2 h-1/2 border-t-2 border-r-2 border-warm-steel/20" aria-hidden="true" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 lg:py-24 px-4 bg-surface-light">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
                  Por qué elegir ShinyBella
                </span>
                <h2 className="text-3xl lg:text-4xl font-bold text-concrete mb-4">
                  Todo lo que necesitas para <span className="text-primary">cuidar tu imagen</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature) => (
                  <article key={feature.title} className="p-6 bg-white rounded-2xl border border-warm-steel/20 hover:border-accent/50 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-accent" aria-hidden="true" />
                    </div>
                    <h3 className="font-semibold text-concrete text-lg mb-2">{feature.title}</h3>
                    <p className="text-warm-steel/60 text-sm">{feature.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 lg:py-24 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
                    Para salones y estilistas
                  </span>
                  <h2 className="text-3xl lg:text-4xl font-bold text-concrete mb-4">
                    Digitaliza tu negocio <span className="text-primary">sin complicaciones</span>
                  </h2>
                  <p className="text-warm-steel/70 text-lg mb-8">
                    Únete a más de 30 salones en Santa Ana que ya gestionan sus citas, reducen ausencias y captan nuevos clientes con ShinyBella.
                  </p>
                  <ul className="space-y-4 mb-8">
                    {[
                      'Agenda digital sincronizada en tiempo real',
                      'Recordatorios automáticos a clientes (WhatsApp/Email)',
                      'Dashboard con métricas: ocupación, ingresos, clientes recurrentes',
                      'Pagos online que garantizan la cita (menos no-shows)',
                      'Perfil público gratis en el mapa de ShinyBella',
                      'Soporte humano y onboarding personalizado',
                    ].map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <span className="text-warm-steel/70">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/afiliarse"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-concrete transition-colors"
                  >
                    Quiero afiliar mi salón <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </Link>
                </div>
                <div className="relative">
                  <div className="aspect-[4/3] bg-gradient-to-br from-accent/20 to-rosewood/20 rounded-2xl border border-warm-steel/20 flex items-center justify-center">
                    <div className="text-center p-8">
                      <Sparkles className="w-16 h-16 text-accent/50 mx-auto mb-4" aria-hidden="true" />
                      <p className="text-concrete/60 text-lg">Dashboard del salón (próximamente)</p>
                      <p className="text-warm-steel/50 text-sm mt-2">Panel de gestión profesional</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg border border-warm-steel/20 max-w-xs">
                    <p className="font-semibold text-concrete">📈 +40% citas confirmadas</p>
                    <p className="text-warm-steel/60 text-sm">Promedio en primeros 3 meses</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 lg:py-24 px-4 bg-concrete text-white">
            <div className="max-w-3xl mx-auto text-center">
              <Sparkles className="w-12 h-12 text-accent mx-auto mb-6" aria-hidden="true" />
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                ¿Listo para tu próxima cita?
              </h2>
              <p className="text-warm-steel/30 text-lg mb-8 max-w-xl mx-auto">
                Únete a cientos de usuarios que ya agendan sin estrés. Encuentra tu salón ideal, elige tu horario y paga en segundos.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-concrete font-semibold rounded-xl hover:bg-surface-light transition-colors text-center"
                >
                  Buscar salones ahora
                </Link>
                <Link
                  href="/auth/registro"
                  className="w-full sm:w-auto px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors text-center"
                >
                  Crear cuenta gratis
                </Link>
              </div>
            </div>
          </section>
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