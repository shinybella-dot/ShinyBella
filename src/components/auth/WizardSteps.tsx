'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Check, Loader2, MapPin, Building2, User, Mail, Phone, FileText, Image, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { paso1Schema, paso2Schema, paso3Schema, wizardSchema, WizardData, tiposNegocio } from '@/lib/validations/negocio';
import FileUpload from '@/components/ui/FileUpload';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: 'Negocio', icon: Building2, description: 'Datos del establecimiento' },
  { id: 2, title: 'Responsable', icon: User, description: 'Persona a cargo' },
  { id: 3, title: 'Documentos', icon: FileText, description: 'Verificación legal' },
];

const geocodeAddress = async (direccion: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const encoded = encodeURIComponent(`${direccion}, Santa Ana, El Salvador`);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1`);
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (e) {
    console.warn('Geocoding failed:', e);
  }
  return null;
};

export default function WizardNegocio() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isValid },
    control,
  } = useForm<WizardData>({
    resolver: zodResolver(wizardSchema),
    mode: 'onChange',
    defaultValues: {
      tipo: 'Salón de belleza',
      descripcion: '',
      horario: 'Lunes a Sábado: 8:00 - 20:00',
    },
  });

  const paso1Data = watch(['nombreSalon', 'tipo', 'direccion', 'telefono', 'email', 'descripcion', 'horario']);
  const paso2Data = watch(['responsable', 'dui_nit', 'cargo', 'email', 'telefono']);
  const [duiUrl, patenteUrl, selfieUrl] = watch(['dui_url', 'patente_url', 'selfie_url']);

  useEffect(() => {
    const saved = localStorage.getItem('afiliacion_wizard');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.entries(parsed).forEach(([key, value]) => setValue(key as keyof WizardData, value as any));
      } catch {}
    }
  }, [setValue]);

  useEffect(() => {
    const data = getValues();
    localStorage.setItem('afiliacion_wizard', JSON.stringify(data));
  }, [getValues]);

  const handleDireccionBlur = async () => {
    const direccion = getValues('direccion');
    if (direccion && direccion.length > 10) {
      setGeocoding(true);
      const coordsResult = await geocodeAddress(direccion);
      if (coordsResult) {
        setCoords(coordsResult);
        toast.success('Ubicación detectada automáticamente');
      }
      setGeocoding(false);
    }
  };

  const nextStep = () => {
    const stepFields: Record<number, string[]> = {
      1: ['nombreSalon', 'tipo', 'direccion', 'telefono', 'email'],
      2: ['responsable', 'dui_nit', 'cargo', 'email', 'telefono'],
      3: [],
    };
    const valid = stepFields[currentStep]?.every(
      (field) => !errors[field as keyof WizardData]
    );
    if (valid || currentStep === 3) {
      setCurrentStep((s) => Math.min(s + 1, 3));
    } else {
      toast.error('Completa los campos obligatorios');
    }
  };

  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const onSubmit = async (data: WizardData) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        lat: coords?.lat,
        lng: coords?.lng,
      };
      const res = await fetch('/api/afiliacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al enviar');
      localStorage.removeItem('afiliacion_wizard');
      toast.success('¡Solicitud enviada! Revisión en 24-48h.');
      setTimeout(() => window.location.href = '/auth/login', 2000);
    } catch (err: any) {
      toast.error(err.message || 'Error al enviar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-5" key="1">
            <h3 className="text-lg font-semibold text-concrete flex items-center gap-2">
              <Building2 className="w-5 h-5 text-accent" />
              Datos del establecimiento
            </h3>
            <p className="text-sm text-warm-steel/60">Información básica de tu salón o negocio</p>

            <Controller
              name="nombreSalon"
              control={control}
              rules={{ required: 'Nombre requerido', minLength: { value: 2, message: 'Mínimo 2 caracteres' } }}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-concrete mb-1">Nombre del salón *</label>
                  <input
                    {...field}
                    type="text"
                    placeholder="Ej. Bella Vista Salon"
                    className="w-full px-4 py-3 bg-surface-light border border-warm-steel/20 rounded-xl text-concrete placeholder-warm-steel/40 focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                  {errors.nombreSalon && <p className="mt-1 text-sm text-red-600">{errors.nombreSalon.message}</p>}
                </div>
              )}
            />

            <Controller
              name="tipo"
              control={control}
              rules={{ required: 'Selecciona un tipo' }}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-concrete mb-1">Tipo de negocio *</label>
                  <select
                    {...field}
                    className="w-full px-4 py-3 bg-surface-light border border-warm-steel/20 rounded-xl text-concrete focus:outline-none focus:ring-2 focus:ring-accent/50"
                  >
                    {['Salón de belleza', 'Barbería', 'Spa', 'Estética', 'Estudio de uñas', 'Otro'].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.tipo && <p className="mt-1 text-sm text-red-600">{errors.tipo.message}</p>}
                </div>
              )}
            />

            <Controller
              name="direccion"
              control={control}
              rules={{ required: 'Dirección requerida', minLength: { value: 5, message: 'Dirección muy corta' } }}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-concrete mb-1 flex items-center gap-1">
                    Dirección *
                    {geocoding && <Loader2 className="w-4 h-4 animate-spin text-accent" />}
                  </label>
                  <input
                    {...field}
                    type="text"
                    onBlur={handleDireccionBlur}
                    placeholder="Colonia, calle, número, ciudad"
                    className="w-full px-4 py-3 bg-surface-light border border-warm-steel/20 rounded-xl text-concrete placeholder-warm-steel/40 focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                  {errors.direccion && <p className="mt-1 text-sm text-red-600">{errors.direccion.message}</p>}
                  <p className="mt-1 text-xs text-warm-steel/50">Se geocodifica automáticamente al salir del campo</p>
                </div>
              )}
            />

            <div className="grid sm:grid-cols-2 gap-5">
              <Controller
                name="telefono"
                control={control}
                rules={{ required: 'Teléfono requerido', pattern: { value: /^[+0-9\s()-]{8,}$/, message: 'Teléfono inválido' } }}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-concrete mb-1">Teléfono *</label>
                    <input
                      {...field}
                      type="tel"
                      placeholder="+503 7000-0000"
                      className="w-full px-4 py-3 bg-surface-light border border-warm-steel/20 rounded-xl text-concrete placeholder-warm-steel/40 focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                    {errors.telefono && <p className="mt-1 text-sm text-red-600">{errors.telefono.message}</p>}
                  </div>
                )}
              />

              <Controller
                name="email"
                control={control}
                rules={{ required: 'Email requerido', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' } }}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-concrete mb-1">Correo electrónico *</label>
                    <input
                      {...field}
                      type="email"
                      placeholder="contacto@tusalon.com"
                      className="w-full px-4 py-3 bg-surface-light border border-warm-steel/20 rounded-xl text-concrete placeholder-warm-steel/40 focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                  </div>
                )}
              />
            </div>

            <Controller
              name="descripcion"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-concrete mb-1">Descripción (opcional)</label>
                  <textarea
                    {...field}
                    rows={3}
                    placeholder="Cuéntanos sobre tu salón, especialidades y servicios destacados..."
                    className="w-full px-4 py-3 bg-surface-light border border-warm-steel/20 rounded-xl text-concrete placeholder-warm-steel/40 focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                  />
                  <p className="mt-1 text-xs text-warm-steel/40 text-right">{field.value?.length || 0}/500</p>
                </div>
              )}
            />

            <Controller
              name="horario"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-concrete mb-1">Horario (opcional)</label>
                  <input
                    {...field}
                    type="text"
                    placeholder="Lunes a Sábado: 8:00 - 20:00"
                    className="w-full px-4 py-3 bg-surface-light border border-warm-steel/20 rounded-xl text-concrete placeholder-warm-steel/40 focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
              )}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-5" key="2">
            <h3 className="text-lg font-semibold text-concrete flex items-center gap-2">
              <User className="w-5 h-5 text-accent" />
              Responsable legal
            </h3>
            <p className="text-sm text-warm-steel/60">Persona autorizada para representar al negocio</p>

            <div className="grid sm:grid-cols-2 gap-5">
              <Controller
                name="responsable"
                control={control}
                rules={{ required: 'Nombre requerido', minLength: { value: 2, message: 'Mínimo 2 caracteres' } }}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-concrete mb-1">Nombre completo *</label>
                    <input
                      {...field}
                      type="text"
                      placeholder="Tu nombre completo"
                      className="w-full px-4 py-3 bg-surface-light border border-warm-steel/20 rounded-xl text-concrete placeholder-warm-steel/40 focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                    {errors.responsable && <p className="mt-1 text-sm text-red-600">{errors.responsable.message}</p>}
                  </div>
                )}
              />

              <Controller
                name="dui_nit"
                control={control}
                rules={{ required: 'DUI/NIT requerido', pattern: { value: /^[0-9-]+$/, message: 'Solo números y guiones' } }}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-concrete mb-1">DUI / NIT *</label>
                    <input
                      {...field}
                      type="text"
                      placeholder="00000000-0 o 0000-000000-000-0"
                      className="w-full px-4 py-3 bg-surface-light border border-warm-steel/20 rounded-xl text-concrete placeholder-warm-steel/40 focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                    {errors.dui_nit && <p className="mt-1 text-sm text-red-600">{errors.dui_nit.message}</p>}
                  </div>
                )}
              />
            </div>

            <Controller
              name="cargo"
              control={control}
              rules={{ required: 'Cargo requerido', minLength: { value: 2, message: 'Mínimo 2 caracteres' } }}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-concrete mb-1">Cargo *</label>
                  <input
                    {...field}
                    type="text"
                    placeholder="Propietario / Gerente / Representante legal"
                    className="w-full px-4 py-3 bg-surface-light border border-warm-steel/20 rounded-xl text-concrete placeholder-warm-steel/40 focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                  {errors.cargo && <p className="mt-1 text-sm text-red-600">{errors.cargo.message}</p>}
                </div>
              )}
            />

            <div className="grid sm:grid-cols-2 gap-5">
              <Controller
                name="email"
                control={control}
                rules={{ required: 'Email requerido', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' } }}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-concrete mb-1">Correo electrónico *</label>
                    <input
                      {...field}
                      type="email"
                      placeholder="contacto@tusalon.com"
                      className="w-full px-4 py-3 bg-surface-light border border-warm-steel/20 rounded-xl text-concrete placeholder-warm-steel/40 focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                  </div>
                )}
              />

              <Controller
                name="telefono"
                control={control}
                rules={{ required: 'Teléfono requerido', pattern: { value: /^[+0-9\s()-]{8,}$/, message: 'Teléfono inválido' } }}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-concrete mb-1">Teléfono / WhatsApp *</label>
                    <input
                      {...field}
                      type="tel"
                      placeholder="+503 7000-0000"
                      className="w-full px-4 py-3 bg-surface-light border border-warm-steel/20 rounded-xl text-concrete placeholder-warm-steel/40 focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                    {errors.telefono && <p className="mt-1 text-sm text-red-600">{errors.telefono.message}</p>}
                  </div>
                )}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5" key="3">
            <h3 className="text-lg font-semibold text-concrete flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              Documentos de verificación
            </h3>
            <p className="text-sm text-warm-steel/60">Sube los documentos para validar tu negocio (PDF, JPG, PNG, WebP · Máx. 5MB c/u)</p>

            <FileUpload
              label="DUI (frente y reverso) *"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onFileSelect={(file) => setValue('dui_url', file ? URL.createObjectURL(file) : '')}
              currentFile={duiUrl ? { name: 'dui.pdf', url: duiUrl, tipo: 'pdf' } : null}
              error={errors.dui_url?.message}
              required
            />

            <FileUpload
              label="Patente de comercio / Registro *"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onFileSelect={(file) => setValue('patente_url', file ? URL.createObjectURL(file) : '')}
              currentFile={patenteUrl ? { name: 'patente.pdf', url: patenteUrl, tipo: 'pdf' } : null}
              error={errors.patente_url?.message}
              required
            />

            <FileUpload
              label="Selfie con DUI (opcional)"
              accept=".jpg,.jpeg,.png,.webp"
              onFileSelect={(file) => setValue('selfie_url', file ? URL.createObjectURL(file) : '')}
              currentFile={selfieUrl ? { name: 'selfie.jpg', url: selfieUrl, tipo: 'image' } : null}
              error={errors.selfie_url?.message}
            />

            <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
              <p className="text-sm text-warm-steel/70 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent" />
                <span>Los documentos se usan solo para verificación. Se almacenan de forma segura en bucket privado y solo el admin puede verlos.</span>
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-light">
      <header className="bg-white border-b border-warm-steel/20 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-warm-steel/60 hover:text-accent">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {STEPS.map((step, i) => (
                <div key={step.id} className="flex flex-col items-center flex-1 relative">
                  {i < STEPS.length - 1 && (
                    <div className="absolute top-5 left-1/2 w-full h-1 bg-warm-steel/20 z-0" />
                  )}
                  <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all ${
                    currentStep > step.id
                      ? 'bg-accent text-white'
                      : currentStep === step.id
                      ? 'bg-accent/10 text-accent border-2 border-accent'
                      : 'bg-warm-steel/10 text-warm-steel/40'
                  }`}>
                    {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <p className="mt-2 text-xs text-center text-warm-steel/60">{step.title}</p>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white rounded-2xl border border-warm-steel/20 p-6 sm:p-8 shadow-sm animate-slide-up">
              {renderStep()}
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-3 border-2 border-warm-steel/30 text-concrete font-semibold rounded-xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Anterior
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-concrete transition-colors flex items-center gap-2"
                >
                  Siguiente
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting || !isValid}
                  className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-concrete transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar solicitud
                      <Check className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>

            <p className="text-center text-xs text-warm-steel/50">
              Al enviar aceptas los <Link href="/terminos" className="underline hover:text-accent">Términos</Link> y <Link href="/privacidad" className="underline hover:text-accent">Privacidad</Link>.
            </p>
          </form>
        </div>
      </main>

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