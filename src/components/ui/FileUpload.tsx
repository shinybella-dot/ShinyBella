'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, FileText, Image, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  label: string;
  accept?: string;
  maxSizeMB?: number;
  onFileSelect: (file: File | null) => void;
  currentFile?: { name: string; url: string; tipo: 'pdf' | 'image' } | null;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

export default function FileUpload({
  label,
  accept = '.pdf,.jpg,.jpeg,.png,.webp',
  maxSizeMB = 5,
  onFileSelect,
  currentFile,
  disabled = false,
  required = false,
  error,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Solo PDF, JPG, PNG o WebP';
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `Máximo ${maxSizeMB}MB`;
    }
    return null;
  }, [maxSizeMB]);

  const handleFile = useCallback((file: File | null) => {
    if (!file) {
      onFileSelect(null);
      setPreview(null);
      return;
    }

    const err = validateFile(file);
    if (err) {
      onFileSelect(null);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((p) => Math.min(p + 10, 90));
    }, 100);

    const reader = new FileReader();
    reader.onload = (e) => {
      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 300);
      const url = e.target?.result as string;
      setPreview(url);
      onFileSelect(file);
    };
    reader.readAsDataURL(file);
  }, [onFileSelect, validateFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const removeFile = () => {
    handleFile(null);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const isImage = currentFile?.tipo === 'image' || preview?.startsWith('data:image');
  const isPdf = currentFile?.tipo === 'pdf' || preview?.startsWith('data:application/pdf');

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-concrete mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 rounded-xl p-6 text-center transition-all ${
          dragActive
            ? 'border-accent bg-accent/5'
            : currentFile || preview
            ? 'border-green-300 bg-green-50'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-warm-steel/20 hover:border-accent/50'
        }`}
        onClick={triggerFileInput}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && triggerFileInput()}
        aria-label={`Subir ${label}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={disabled || uploading}
          aria-hidden="true"
        />

        {uploading && (
          <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-10 rounded-xl">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-medium text-concrete">Subiendo...</p>
            <div className="w-48 h-2 bg-warm-steel/20 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-warm-steel/50 mt-1">{uploadProgress}%</p>
          </div>
        )}

        {(currentFile || preview) && !uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white border border-warm-steel/20 flex items-center justify-center">
              {isImage && preview && (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              )}
              {isPdf && (
                <FileText className="w-12 h-12 text-red-500" />
              )}
              {!isImage && !isPdf && currentFile && (
                <FileText className="w-12 h-12 text-warm-steel/50" />
              )}
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(); }}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                aria-label="Eliminar archivo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-medium text-concrete truncate max-w-[200px]">
                {currentFile?.name || 'Archivo seleccionado'}
              </p>
              <p className="text-xs text-warm-steel/50">
                {currentFile ? `${(currentFile as any).size ? ((currentFile as any).size / 1024).toFixed(1) + ' KB' : ''}` : ''}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-10 h-10 text-warm-steel/30" />
            <p className="text-warm-steel/60">Arrastra o haz click para subir</p>
            <p className="text-xs text-warm-steel/40">PDF, JPG, PNG, WebP · Máx. {maxSizeMB}MB</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {currentFile && !error && !uploading && (
        <div className="mt-2 flex items-center gap-1.5 text-green-600 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Archivo listo para enviar</span>
        </div>
      )}
    </div>
  );
}