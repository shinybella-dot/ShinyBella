'use client';

import { useState } from 'react';
import { Eye, Download, X, ChevronLeft, ChevronRight, FileText, Image } from 'lucide-react';

interface Document {
  nombre: string;
  url: string;
  tipo: 'pdf' | 'image';
}

interface DocumentViewerProps {
  documents: Document[];
  onClose: () => void;
  title?: string;
}

export default function DocumentViewer({ documents, onClose, title = 'Documentos' }: DocumentViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentDoc = documents[currentIndex];

  const goPrev = () => setCurrentIndex((i) => (i === 0 ? documents.length - 1 : i - 1));
  const goNext = () => setCurrentIndex((i) => (i === documents.length - 1 ? 0 : i + 1));

  if (documents.length === 0) {
    return (
      <Modal isOpen={true} onClose={onClose} title={title} size="md">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-warm-steel/30 mx-auto mb-4" />
          <p className="text-warm-steel/60">No hay documentos para mostrar</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={title} size="xl">
      <div className="space-y-4">
        {documents.length > 1 && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 overflow-x-auto pb-2">
              <div className="flex gap-2 min-w-max">
                {documents.map((doc, i) => (
                  <button
                    key={doc.nombre}
                    onClick={() => setCurrentIndex(i)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      i === currentIndex
                        ? 'bg-accent text-white'
                        : 'bg-warm-steel/10 text-warm-steel/70 hover:bg-warm-steel/20'
                    }`}
                  >
                    {doc.tipo === 'pdf' ? <FileText className="w-3 h-3 inline mr-1" /> : <Image className="w-3 h-3 inline mr-1" />}
                    {doc.nombre.length > 20 ? doc.nombre.slice(0, 17) + '...' : doc.nombre}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-warm-steel/60">
              <span>{currentIndex + 1} / {documents.length}</span>
            </div>
          </div>
        )}

        <div className="relative aspect-[4/3] bg-warm-steel/5 rounded-xl overflow-hidden">
          {currentDoc.tipo === 'pdf' ? (
            <iframe
              src={`${currentDoc.url}#toolbar=0&navpanes=0&scrollbar=1`}
              className="w-full h-full"
              title={currentDoc.nombre}
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <img
              src={currentDoc.url}
              alt={currentDoc.nombre}
              className="w-full h-full object-contain p-4"
            />
          )}

          {documents.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-5 h-5 text-concrete" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-5 h-5 text-concrete" />
              </button>
            </>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-sm font-medium text-concrete truncate max-w-[70%]">{currentDoc.nombre}</p>
          <div className="flex items-center gap-2">
            <a
              href={currentDoc.url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-warm-steel/20 text-sm text-warm-steel/70 hover:bg-warm-steel/10 transition-colors"
            >
              <Download className="w-4 h-4" />
              Descargar
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Modal({ isOpen, onClose, title, size = 'md', children }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  const sizeClasses: Record<string, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw]',
  };

  const sizeClass = sizeClasses[size] || 'max-w-lg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="doc-title">
      <div className={`w-full ${sizeClass} bg-white rounded-2xl shadow-xl`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-warm-steel/20">
          <h2 id="doc-title" className="text-xl font-bold text-concrete">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-warm-steel/50 hover:bg-warm-steel/10" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}