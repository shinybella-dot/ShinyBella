'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import DocumentViewer from './DocumentViewer';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Mail, MapPin, Phone, Building2, User, Clock, FileText, AlertCircle, CheckCircle, XCircle, X } from 'lucide-react';

interface Solicitud {
  id: string;
  folio: string;
  estado: 'pendiente' | 'en_revision' | 'aprobada' | 'rechazada';
  salon_id: string;
  datos_negocio: {
    nombreSalon: string;
    tipo: string;
    direccion: string;
    telefono: string;
    email: string;
    descripcion?: string;
  };
  datos_responsable: {
    responsable: string;
    dui_nit: string;
    cargo: string;
    email: string;
    telefono: string;
  };
  documentos: {
    dui_url?: string;
    patente_url?: string;
    selfie_url?: string;
  };
  admin_notas?: string;
  creado_en: string;
  revisado_en?: string;
}

interface SolicitudDetalleModalProps {
  solicitud: Solicitud | null;
  isOpen: boolean;
  onClose: () => void;
  onAprobar: (id: string) => Promise<void>;
  onRechazar: (id: string, motivo: string) => Promise<void>;
  loading?: boolean;
}

const estadoLabels: Record<string, { label: string; color: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' }> = {
  pendiente: { label: 'Pendiente', color: 'warning' },
  en_revision: { label: 'En revisión', color: 'default' },
  aprobada: { label: 'Aprobada', color: 'success' },
  rechazada: { label: 'Rechazada', color: 'destructive' },
};

export default function SolicitudDetalleModal({
  solicitud,
  isOpen,
  onClose,
  onAprobar,
  onRechazar,
  loading,
}: SolicitudDetalleModalProps) {
  const [rejectMotivo, setRejectMotivo] = useState('');
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleAprobar = async () => {
    if (!solicitud) return;
    setActionLoading(true);
    try {
      await onAprobar(solicitud.id);
      setShowApproveConfirm(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRechazar = async () => {
    if (!solicitud || !rejectMotivo.trim()) return;
    setActionLoading(true);
    try {
      await onRechazar(solicitud.id, rejectMotivo.trim());
      setShowRejectConfirm(false);
      setRejectMotivo('');
    } finally {
      setActionLoading(false);
    }
  };

  if (!solicitud || !isOpen) return null;

  const docs = Object.entries(solicitud.documentos)
    .filter(([, url]) => url)
    .map(([key, url]) => ({
      nombre: key === 'dui_url' ? 'DUI (frente/reverso)' : key === 'patente_url' ? 'Patente de comercio' : 'Selfie con DUI',
      url: url!,
      tipo: 'pdf' as const,
    }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Solicitud ${solicitud.folio}`} size="xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Building2 className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center" />
            <div>
              <p className="text-xl font-bold text-concrete">{solicitud.datos_negocio.nombreSalon}</p>
              <p className="text-sm text-warm-steel/60">{solicitud.datos_negocio.tipo}</p>
            </div>
          </div>
          <Badge variant={estadoLabels[solicitud.estado].color}>
            {estadoLabels[solicitud.estado].label}
          </Badge>
        </div>

        <Tabs defaultValue="negocio" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="negocio">Datos del negocio</TabsTrigger>
            <TabsTrigger value="responsable">Responsable</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
          </TabsList>

          <TabsContent value="negocio" className="space-y-4 pt-4">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-warm-steel/50">Nombre</dt>
                <dd className="font-medium text-concrete">{solicitud.datos_negocio.nombreSalon}</dd>
              </div>
              <div>
                <dt className="text-warm-steel/50">Tipo</dt>
                <dd className="font-medium text-concrete">{solicitud.datos_negocio.tipo}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-warm-steel/50">Dirección</dt>
                <dd className="font-medium text-concrete flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-warm-steel/50" />
                  {solicitud.datos_negocio.direccion}
                </dd>
              </div>
              <div>
                <dt className="text-warm-steel/50">Teléfono</dt>
                <dd className="font-medium text-concrete flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-warm-steel/50" />
                  <a href={`tel:${solicitud.datos_negocio.telefono}`} className="hover:text-accent">{solicitud.datos_negocio.telefono}</a>
                </dd>
              </div>
              <div>
                <dt className="text-warm-steel/50">Email</dt>
                <dd className="font-medium text-concrete flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-warm-steel/50" />
                  <a href={`mailto:${solicitud.datos_negocio.email}`} className="hover:text-accent">{solicitud.datos_negocio.email}</a>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-warm-steel/50">Descripción</dt>
                <dd className="font-medium text-concrete mt-1 whitespace-pre-line">{solicitud.datos_negocio.descripcion || 'Sin descripción'}</dd>
              </div>
              <div>
                <dt className="text-warm-steel/50">Fecha de solicitud</dt>
                <dd className="font-medium text-concrete flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-warm-steel/50" />
                  {new Date(solicitud.creado_en).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </dd>
              </div>
            </dl>
          </TabsContent>

          <TabsContent value="responsable" className="space-y-4 pt-4">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-warm-steel/50">Nombre</dt>
                <dd className="font-medium text-concrete flex items-center gap-1.5">
                  <User className="w-4 h-4 text-warm-steel/50" />
                  {solicitud.datos_responsable.responsable}
                </dd>
              </div>
              <div>
                <dt className="text-warm-steel/50">DUI / NIT</dt>
                <dd className="font-medium text-concrete">{solicitud.datos_responsable.dui_nit}</dd>
              </div>
              <div>
                <dt className="text-warm-steel/50">Cargo</dt>
                <dd className="font-medium text-concrete">{solicitud.datos_responsable.cargo}</dd>
              </div>
              <div>
                <dt className="text-warm-steel/50">Email</dt>
                <dd className="font-medium text-concrete flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-warm-steel/50" />
                  <a href={`mailto:${solicitud.datos_responsable.email}`} className="hover:text-accent">{solicitud.datos_responsable.email}</a>
                </dd>
              </div>
              <div>
                <dt className="text-warm-steel/50">Teléfono</dt>
                <dd className="font-medium text-concrete flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-warm-steel/50" />
                  <a href={`tel:${solicitud.datos_responsable.telefono}`} className="hover:text-accent">{solicitud.datos_responsable.telefono}</a>
                </dd>
              </div>
            </dl>
          </TabsContent>

          <TabsContent value="documentos" className="pt-4">
            {docs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {docs.map((doc) => (
                  <button
                    key={doc.nombre}
                    onClick={() => { /* DocumentViewer se maneja fuera */ }}
                    className="p-4 rounded-xl border border-warm-steel/20 hover:border-accent/50 hover:bg-accent/5 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-6 h-6 text-warm-steel/50 group-hover:text-accent transition-colors" />
                      <span className="font-medium text-concrete text-sm">{doc.nombre}</span>
                    </div>
                    <p className="text-xs text-warm-steel/50">Click para ver en visor</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-warm-steel/30 mx-auto mb-3" />
                <p className="text-warm-steel/60">No hay documentos subidos</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {solicitud.admin_notas && (
          <div className="p-4 bg-warm-steel/5 border border-warm-steel/20 rounded-xl">
            <p className="text-sm font-medium text-warm-steel/70 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Notas del administrador
            </p>
            <p className="text-sm text-concrete mt-1 whitespace-pre-line">{solicitud.admin_notas}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-warm-steel/20">
          {solicitud.estado === 'pendiente' || solicitud.estado === 'en_revision' ? (
            <>
              <button
                onClick={() => setShowRejectConfirm(true)}
                disabled={loading || actionLoading}
                className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4 inline mr-1" />
                Rechazar
              </button>
              <button
                onClick={() => setShowApproveConfirm(true)}
                disabled={loading || actionLoading}
                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-concrete transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Aprobar
              </button>
            </>
          ) : solicitud.estado === 'aprobada' ? (
            <span className="flex items-center gap-2 text-green-600 px-4 py-2 rounded-lg bg-green-50">
              <CheckCircle className="w-4 h-4" />
              Solicitud aprobada el {solicitud.revisado_en ? new Date(solicitud.revisado_en).toLocaleDateString('es-ES') : 'fecha desconocida'}
            </span>
          ) : (
            <span className="flex items-center gap-2 text-red-600 px-4 py-2 rounded-lg bg-red-50">
              <XCircle className="w-4 h-4" />
              Solicitud rechazada {solicitud.revisado_en ? `el ${new Date(solicitud.revisado_en).toLocaleDateString('es-ES')}` : ''}
            </span>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        onConfirm={handleAprobar}
        title="Confirmar aprobación"
        message={`¿Estás seguro de aprobar la solicitud de "${solicitud.datos_negocio.nombreSalon}"? Se enviará un email al responsable con el enlace para activar su plan.`}
        confirmLabel="Aprobar"
        variant="primary"
        loading={actionLoading}
      />

      <ConfirmDialog
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={handleRechazar}
        title="Confirmar rechazo"
        message="¿Estás seguro de rechazar esta solicitud? Deberás indicar el motivo."
        confirmLabel="Rechazar"
        variant="danger"
        loading={actionLoading}
      >
        <div className="mb-4">
          <label htmlFor="reject-motivo" className="block text-sm font-medium text-concrete mb-2">
            Motivo del rechazo *
          </label>
          <textarea
            id="reject-motivo"
            value={rejectMotivo}
            onChange={(e) => setRejectMotivo(e.target.value)}
            rows={3}
            placeholder="Explica el motivo del rechazo..."
            className="w-full p-3 bg-surface-light border border-warm-steel/20 rounded-xl text-concrete placeholder-warm-steel/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent resize-none"
            required
          />
        </div>
      </ConfirmDialog>

      {docs.length > 0 && (
        <DocumentViewer
          documents={docs}
          onClose={() => {}}
          title={`Documentos - ${solicitud.datos_negocio.nombreSalon}`}
        />
      )}
    </Modal>
  );
}