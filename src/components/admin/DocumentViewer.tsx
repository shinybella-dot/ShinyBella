'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, X, FileText, Loader2, AlertCircle } from 'lucide-react';

export interface DocumentoParaVer {
  path: string;
  nombre: string;
}

interface DocumentViewerProps {
  documento: DocumentoParaVer | null;
  onClose: () => void;
}

export default function DocumentViewer({ documento, onClose }: DocumentViewerProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!documento) return;

    const controller = new AbortController();

    const load = async () => {
      setSignedUrl(null);
      setLoadError(null);
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/documentos?path=${encodeURIComponent(documento.path)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error('No se pudo abrir el documento');
        const result = await res.json();
        if (typeof result.url !== 'string') throw new Error('URL inválida');
        setSignedUrl(result.url);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Error cargando documento:', error);
          setLoadError('No se pudo cargar el documento. Intenta de nuevo.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void load();
    return () => controller.abort();
  }, [documento]);

  useEffect(() => {
    if (!documento) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [documento, onClose]);

  if (!documento || typeof window === 'undefined') return null;

  const extension = documento.path.split('.').pop()?.toLowerCase() ?? '';
  const isPdf = extension === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(extension);

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="documento-title"
    >
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-warm-steel/20">
          <h2 id="documento-title" className="text-lg font-bold text-concrete truncate">
            {documento.nombre}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-warm-steel/50 hover:bg-warm-steel/10"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <p className="text-sm text-warm-steel/60">Cargando documento...</p>
            </div>
          )}

          {!loading && loadError && (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <p className="text-sm text-red-600">{loadError}</p>
            </div>
          )}

          {!loading && !loadError && signedUrl && (
            <>
              <div className="relative aspect-[4/3] bg-warm-steel/5 rounded-xl overflow-hidden">
                {isPdf && (
                  <iframe
                    src={`${signedUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                    className="w-full h-full"
                    title={documento.nombre}
                    sandbox="allow-scripts allow-same-origin"
                  />
                )}
                {isImage && (
                  <img
                    src={signedUrl}
                    alt={documento.nombre}
                    className="w-full h-full object-contain p-4"
                  />
                )}
                {!isPdf && !isImage && (
                  <div className="flex flex-col items-center justify-center gap-3 h-full">
                    <FileText className="w-12 h-12 text-warm-steel/40" />
                    <p className="text-sm text-warm-steel/60">Vista previa no disponible</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3">
                <a
                  href={signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-warm-steel/20 text-sm text-warm-steel/70 hover:bg-warm-steel/10 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Descargar
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
