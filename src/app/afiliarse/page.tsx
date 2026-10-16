'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Store,
  User,
  Users,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const tiposNegocio = ['Salón de belleza', 'Barbería', 'Spa', 'Estética', 'Estudio de uñas', 'Otro'];
const planes = [
  { id: 'basico', nombre: 'Básico', precio: 'Gratis', descripcion: 'Perfil público en el mapa, agenda digital y recordatorios básicos.' },
  { id: 'pro', nombre: 'Pro', precio: '$19/mes', descripcion: 'Todo lo del Básico + pagos online, métricas y soporte prioritario.', destacado: true },
  { id: 'empresarial', nombre: 'Empresarial', precio: '$49/mes', descripcion: 'Multi-sucursal, reportes avanzados y onboarding personalizado.' },
];

interface FormData {
  nombreSalon: string;
  tipo: string;
  direccion: string;
  telefono: string;
  email: string;
  responsable: string;
  numEstilistas: string;
  plan: string;
  descripcion: string;
}

const initialData: FormData = {
  nombreSalon: '',
  tipo: 'Salón de belleza',
  direccion: '',
  telefono: '',
  email: '',
  responsable: '',
  numEstilistas: '1-3',
  plan: 'pro',
  descripcion: '',
};

const inputClass =
  'w-full pl-10 pr-4 py-3 bg-surface-light border border-warm-steel/20 rounded-xl text-concrete placeholder-warm-steel/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent';

export default function AfiliarsePage() {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [folio, setFolio] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nombreSalon.trim() || !formData.direccion.trim() || !formData.responsable.trim()) {
      setError('Completa los campos obligatorios: nombre del salón, dirección y responsable.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }
    if (!/^[+0-9\s()-]{8,}$/.test(formData.telefono)) {
      setError('Ingresa un teléfono válido (mínimo 8 dígitos).');
      return;
    }

    setLoading(true);

    // Simulación de envío (sin almacenamiento real)
    await new Promise((resolve) => setTimeout(resolve, 1800));

    const folioGenerado = `AF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setFolio(folioGenerado);
    setLoading(false);
    setSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (success) {
    return (
      <div className="flex flex-col min-h-screen bg-surface-light">
        <Header />
        <main className="flex-1">
          <div className="max-w-2xl mx-auto px-4 py-16">
            <div className="bg-white rounded-2xl border border-warm-steel/20 p-8 shadow-sm text-center animate-slide-up">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-accent" aria-hidden="true" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-concrete mb-2">
                ¡Solicitud recibida!
              </h1>
              <p className="text-warm-steel/70 mb-6">
                Gracias, <span className="font-medium text-concrete">{formData.responsable}</span>. Hemos registrado la afiliación de{' '}
                <span className="font-medium text-concrete">{formData.nombreSalon}</span> en modo demostración.
              </p>

              <div className="bg-surface-light rounded-xl p-6 mb-6">
                <p className="text-warm-steel/60 text-sm mb-2">Tu número de seguimiento</p>
                <code className="text-2xl font-mono font-bold text-concrete tracking-widest bg-white px-4 py-2 rounded-lg border border-warm-steel/20 inline-block">
                  {folio}
                </code>
                <p className="text-warm-steel/50 text-xs mt-3">Guardalo para consultar el estado de tu solicitud</p>
              </div>

              <div className="text-left bg-white border border-warm-steel/20 rounded-xl p-6 mb-6">
                <h2 className="font-semibold text-concrete mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" aria-hidden="true" />
                  Próximos pasos (simulados)
                </h2>
                <ol className="space-y-3 text-sm text-warm-steel/70">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                    Nuestro equipo revisa tu información (24-48h)
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                    Te contactamos al correo <span className="font-medium text-concrete">{formData.email}</span> para verificar tu negocio
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                    Activamos tu perfil y agenda en ShinyBella
                  </li>
                </ol>
              </div>

              <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl text-sm text-warm-steel/70 mb-6">
                <p>
                  <span className="font-semibold text-concrete">Modo demo:</span> esta es una simulación — no se almacenó ni envió información real.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-concrete transition-colors text-center"
                >
                  Volver al inicio
                </Link>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setFormData(initialData);
                  }}
                  className="px-6 py-3 border-2 border-warm-steel/30 text-concrete font-semibold rounded-xl hover:bg-white transition-colors text-center"
                >
                  Registrar otro salón
                </button>
              </div>
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

  return (
    <div className="flex flex-col min-h-screen bg-surface-light">
      <Header />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-warm-steel/60 hover:text-accent transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Volver
          </Link>

          <div className="bg-white rounded-2xl border border-warm-steel/20 p-6 sm:p-8 mb-8 shadow-sm">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
              Para salones y estilistas
            </span>
            <h1 className="text-2xl lg:text-3xl font-bold text-concrete mb-2 flex items-center gap-3">
              <Store className="w-8 h-8 text-accent" aria-hidden="true" />
              Afilia tu establecimiento
            </h1>
            <p className="text-warm-steel/70">
              Únete a ShinyBella y empieza a recibir citas online en minutos. Completa el formulario y nuestro equipo se pondrá en contacto contigo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            <section className="bg-white rounded-2xl border border-warm-steel/20 p-6 space-y-5">
              <h2 className="font-semibold text-concrete flex items-center gap-2">
                <Building2 className="w-5 h-5 text-accent" aria-hidden="true" />
                Datos del establecimiento
              </h2>

              <div>
                <label htmlFor="nombreSalon" className="block text-sm font-medium text-concrete mb-2">
                  Nombre del salón *
                </label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-steel/40" aria-hidden="true" />
                  <input
                    id="nombreSalon"
                    name="nombreSalon"
                    type="text"
                    value={formData.nombreSalon}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    className={inputClass}
                    placeholder="Ej. Bella Vista Salon"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="tipo" className="block text-sm font-medium text-concrete mb-2">
                    Tipo de negocio
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className={inputClass.replace('pl-10', 'pl-4')}
                  >
                    {tiposNegocio.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="numEstilistas" className="block text-sm font-medium text-concrete mb-2">
                    Número de estilistas
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-steel/40" aria-hidden="true" />
                    <select
                      id="numEstilistas"
                      name="numEstilistas"
                      value={formData.numEstilistas}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="1-3">1 - 3</option>
                      <option value="4-10">4 - 10</option>
                      <option value="11-20">11 - 20</option>
                      <option value="20+">Más de 20</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="direccion" className="block text-sm font-medium text-concrete mb-2">
                  Dirección *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-steel/40" aria-hidden="true" />
                  <input
                    id="direccion"
                    name="direccion"
                    type="text"
                    value={formData.direccion}
                    onChange={handleChange}
                    required
                    maxLength={200}
                    className={inputClass}
                    placeholder="Colonia, calle, número, ciudad"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-concrete mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                  className="w-full p-3 bg-surface-light border border-warm-steel/20 rounded-xl text-concrete placeholder-warm-steel/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent resize-none"
                  placeholder="Cuéntanos sobre tu salón, especialidades y servicios destacados..."
                />
                <p className="text-warm-steel/40 text-xs mt-1 text-right">{formData.descripcion.length}/500</p>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-warm-steel/20 p-6 space-y-5">
              <h2 className="font-semibold text-concrete flex items-center gap-2">
                <User className="w-5 h-5 text-accent" aria-hidden="true" />
                Contacto responsable
              </h2>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="responsable" className="block text-sm font-medium text-concrete mb-2">
                    Nombre del responsable *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-steel/40" aria-hidden="true" />
                    <input
                      id="responsable"
                      name="responsable"
                      type="text"
                      value={formData.responsable}
                      onChange={handleChange}
                      required
                      maxLength={100}
                      className={inputClass}
                      placeholder="Tu nombre completo"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-concrete mb-2">
                    Teléfono / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-steel/40" aria-hidden="true" />
                    <input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder="+503 7000-0000"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-concrete mb-2">
                  Correo electrónico *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-steel/40" aria-hidden="true" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className={inputClass}
                    placeholder="contacto@tusalon.com"
                  />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-warm-steel/20 p-6 space-y-5">
              <h2 className="font-semibold text-concrete flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" aria-hidden="true" />
                Elige tu plan
              </h2>

              <div className="grid sm:grid-cols-3 gap-4" role="radiogroup" aria-label="Planes de afiliación">
                {planes.map((plan) => (
                  <label
                    key={plan.id}
                    className={`relative block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.plan === plan.id
                        ? 'border-accent bg-accent/5 shadow-sm'
                        : 'border-warm-steel/20 bg-white hover:border-accent/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={plan.id}
                      checked={formData.plan === plan.id}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-concrete">{plan.nombre}</span>
                      <span className={`text-sm font-bold ${formData.plan === plan.id ? 'text-accent' : 'text-warm-steel/60'}`}>
                        {plan.precio}
                      </span>
                    </div>
                    <p className="text-warm-steel/60 text-xs leading-relaxed">{plan.descripcion}</p>
                    {plan.destacado && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-accent text-white text-[10px] font-semibold rounded-full">
                        Recomendado
                      </span>
                    )}
                    {formData.plan === plan.id && (
                      <CheckCircle className="w-5 h-5 text-accent absolute top-3 right-3" aria-hidden="true" />
                    )}
                  </label>
                ))}
              </div>
            </section>

            <p className="text-warm-steel/50 text-xs text-center">
              Al enviar aceptas los <Link href="/terminos" className="underline hover:text-accent">Términos y condiciones</Link> y la{' '}
              <Link href="/privacidad" className="underline hover:text-accent">Política de privacidad</Link>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-concrete transition-colors text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  Enviando solicitud...
                </>
              ) : (
                <>
                  Enviar solicitud de afiliación
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </>
              )}
            </button>

            <p className="text-center text-warm-steel/50 text-xs">
              Modo demostración: la solicitud se simula, no se almacena información real.
            </p>
          </form>
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