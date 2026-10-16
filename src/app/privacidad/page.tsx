'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle, Shield, User, Mail, Phone, Database, Trash2, Lock, Eye, Globe, Calendar } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacidadPage() {
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
              <h1 className="text-3xl font-bold text-concrete mb-2">Política de Privacidad</h1>
              <p className="text-warm-steel/60">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </header>

            <div className="space-y-8 text-warm-steel/70 leading-relaxed">
              <section>
                <h2 className="text-xl font-semibold text-concrete mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" aria-hidden="true" />
                  1. Responsable del tratamiento
                </h2>
                <p><strong>ShinyBella</strong> (en adelante, "nosotros", "la plataforma") es responsable del tratamiento de tus datos personales.</p>
                <p>Contacto: <a href="mailto:privacidad@shinybella.com" className="text-accent hover:underline">privacidad@shinybella.com</a></p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-concrete mb-3 flex items-center gap-2">
                  <Database className="w-5 h-5 text-accent" aria-hidden="true" />
                  2. Datos que recopilamos
                </h2>
                <h3 className="font-medium text-concrete mb-2">Datos de cuenta</h3>
                <ul className="space-y-1 list-disc list-inside mb-4">
                  <li>Nombre completo</li>
                  <li>Correo electrónico</li>
                  <li>Teléfono (opcional)</li>
                  <li>Contraseña (hasheada, nunca la vemos)</li>
                  <li>Foto de perfil (opcional)</li>
                </ul>
                <h3 className="font-medium text-concrete mb-2">Datos de reservas</h3>
                <ul className="space-y-1 list-disc list-inside mb-4">
                  <li>Servicio, salón, estilista seleccionados</li>
                  <li>Fecha y hora de la cita</li>
                  <li>Historial de citas (pasadas, canceladas, completadas)</li>
                </ul>
                <h3 className="font-medium text-concrete mb-2">Datos técnicos</h3>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Dirección IP, tipo de navegador, sistema operativo</li>
                  <li>Páginas visitadas, tiempo de sesión</li>
                  <li>Cookies y tecnologías similares</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-concrete mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-accent" aria-hidden="true" />
                  3. Finalidad del tratamiento
                </h2>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Gestionar tu cuenta y autenticación</li>
                  <li>Procesar y confirmar reservas</li>
                  <li>Enviar recordatorios (email/WhatsApp) 24h antes</li>
                  <li>Procesar pagos seguros vía Stripe</li>
                  <li>Mejorar la plataforma (analítica anonimizada)</li>
                  <li>Cumplir obligaciones legales</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-concrete mb-3 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-accent" aria-hidden="true" />
                  4. Base legal
                </h2>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Ejecución de contrato:</strong> reservas, pagos, gestión de cuenta</li>
                  <li><strong>Consentimiento:</strong> marketing, foto de perfil, ubicación</li>
                  <li><strong>Interés legítimo:</strong> seguridad, prevención fraude, mejora del servicio</li>
                  <li><strong>Obligación legal:</strong> facturación, contabilidad</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-concrete mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-accent" aria-hidden="true" />
                  5. Destinatarios y transferencias
                </h2>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Salones y estilistas:</strong> datos necesarios para la cita (nombre, teléfono, servicio)</li>
                  <li><strong>Stripe:</strong> datos de pago (nombre, email, monto) - <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Política Stripe</a></li>
                  <li><strong>Supabase:</strong> alojamiento de base de datos y auth - <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Política Supabase</a></li>
                  <li><strong>Vercel:</strong> hosting y analítica - <a href="https://vercel.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Política Vercel</a></li>
                  <li>No vendemos tus datos a terceros.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-concrete mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent" aria-hidden="true" />
                  6. Conservación
                </h2>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Datos de cuenta: mientras la cuenta esté activa</li>
                  <li>Historial de reservas: 5 años (obligación fiscal)</li>
                  <li>Datos de pago: según normativa PCI DSS y fiscal</li>
                  <li>Logs técnicos: 30 días</li>
                  <li>Puedes solicitar eliminación anticipada (ver derechos)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-concrete mb-3 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-accent" aria-hidden="true" />
                  7. Tus derechos (Ley PDP El Salvador / GDPR)
                </h2>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Acceso:</strong> saber qué datos tenemos</li>
                  <li><strong>Rectificación:</strong> corregir datos inexactos</li>
                  <li><strong>Supresión:</strong> "derecho al olvido" (salvo obligación legal)</li>
                  <li><strong>Limitación:</strong> restringir tratamiento</li>
                  <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado</li>
                  <li><strong>Oposición:</strong> oponerte a marketing directo</li>
                  <li>Ejercicio: <a href="mailto:privacidad@shinybella.com" className="text-accent hover:underline">privacidad@shinybella.com</a></li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-concrete mb-3 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-accent" aria-hidden="true" />
                  8. Eliminación de cuenta
                </h2>
                <p>Puedes eliminar tu cuenta desde <strong>Mi Perfil → Zona de peligro → Cerrar sesión</strong> (próximamente: botón "Eliminar cuenta"). Esto borra:</p>
                <ul className="space-y-1 list-disc list-inside mt-2">
                  <li>Datos de perfil (nombre, email, foto)</li>
                  <li>Reservas futuras (se cancelan)</li>
                  <li>Historial se anonimiza (se conserva 5 años por obligación fiscal)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-concrete mb-3 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-accent" aria-hidden="true" />
                  9. Cookies y tecnologías similares
                </h2>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Esenciales:</strong> sesión, autenticación, seguridad (siempre activas)</li>
                  <li><strong>Analíticas:</strong> uso de la web (opcional, configurable)</li>
                  <li><strong>Marketing:</strong> anuncios personalizados (no usamos actualmente)</li>
                  <li>Gestiona preferencias en la configuración del navegador.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-concrete mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" aria-hidden="true" />
                  10. Seguridad
                </h2>
                <ul className="space-y-2 list-disc list-inside">
                  <li>HTTPS/TLS 1.3 en todas las comunicaciones</li>
                  <li>Contraseñas hasheadas con bcrypt (Supabase Auth)</li>
                  <li>Pagos tokenizados (Stripe, nosotros no vemos tarjetas)</li>
                  <li>RLS (Row Level Security) en base de datos</li>
                  <li>Acceso a datos solo por personal autorizado</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-concrete mb-3 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-accent" aria-hidden="true" />
                  11. Contacto DPO
                </h2>
                <p>Delegado de Protección de Datos: <a href="mailto:dpo@shinybella.com" className="text-accent hover:underline">dpo@shinybella.com</a></p>
                <p>Autoridad de control: Instituto de Acceso a la Información Pública (IAIP) - El Salvador</p>
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