'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface CurrentFile {
  name: string;
  url: string;
  tipo: 'pdf' | 'image';
}

interface FileUploadProps {
  label: string;
  accept?: string;
  maxSizeMB?: number;
  onFileSelect: (value: File | string | null) => void;
  currentFile?: CurrentFile | null;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  uploadPath?: string;
}

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

function getExtension(name: string) {
  const index = name.lastIndexOf('.');
  return index >= 0 ? name.slice(index + 1).toLowerCase() : '';
}

function getAllowedExtensions(accept: string) {
  return accept
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.startsWith('.'))
    .map((value) => value.slice(1));
}

export default function FileUpload({
  label,
  accept = '.pdf,.jpg,.jpeg,.png,.webp',
  maxSizeMB = 5,
  onFileSelect,
  currentFile,
  disabled = false,
  required = false,
  error,
  uploadPath,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewTipo, setPreviewTipo] = useState<'pdf' | 'image' | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  const clearPreview = useCallback(() => {
    if (previewUrlRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = null;
    setPreview(null);
    setPreviewTipo(null);
  }, []);

  useEffect(() => () => {
    if (previewUrlRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Solo PDF, JPG, PNG o WebP';
    }
    const allowedExtensions = getAllowedExtensions(accept);
    if (allowedExtensions.length > 0 && !allowedExtensions.includes(getExtension(file.name))) {
      return `Formato no permitido. Usa ${accept}`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `Máximo ${maxSizeMB}MB`;
    }
    return null;
  }, [accept, maxSizeMB]);

  const handleFile = useCallback(async (file: File | null) => {
    if (disabled || uploading) return;

    if (!file) {
      clearPreview();
      setValidationError(null);
      onFileSelect(null);
      return;
    }

    const err = validateFile(file);
    if (err) {
      clearPreview();
      setValidationError(err);
      onFileSelect(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setValidationError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      if (uploadPath) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Credenciales de Supabase no configuradas');
        }

        const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
        const path = `${uploadPath.replace(/\/$/, '')}/${crypto.randomUUID()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('verificaciones')
          .upload(path, file, { upsert: false, contentType: file.type });

        if (uploadError) throw uploadError;

        clearPreview();
        previewUrlRef.current = URL.createObjectURL(file);
        setPreview(previewUrlRef.current);
        setPreviewTipo(file.type === 'application/pdf' ? 'pdf' : 'image');
        setUploadProgress(100);
        onFileSelect(path);
      } else {
        clearPreview();
        previewUrlRef.current = URL.createObjectURL(file);
        setPreview(previewUrlRef.current);
        setPreviewTipo(file.type === 'application/pdf' ? 'pdf' : 'image');
        setUploadProgress(100);
        onFileSelect(file);
      }
    } catch (uploadError) {
      clearPreview();
      setValidationError(
        uploadPath
          ? 'No se pudo subir el archivo. Intenta de nuevo.'
          : 'No se pudo preparar el archivo.'
      );
      onFileSelect(null);
      console.error('FileUpload error:', uploadError);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [clearPreview, disabled, onFileSelect, uploadPath, uploading, validateFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      void handleFile(e.dataTransfer.files[0]);
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
    void handleFile(null);
  };

  const triggerFileInput = () => {
    if (!disabled && !uploading) fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      void handleFile(e.target.files[0]);
    }
  };

  const displayedError = error || validationError;
  const isImage = currentFile?.tipo === 'image' || previewTipo === 'image';
  const isPdf = currentFile?.tipo === 'pdf' || previewTipo === 'pdf';

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
            : displayedError
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
              {!isImage && !isPdf && (
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
            <p className="font-medium text-concrete truncate max-w-[200px]">
              {currentFile?.name || 'Archivo seleccionado'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-10 h-10 text-warm-steel/30" />
            <p className="text-warm-steel/60">Arrastra o haz click para subir</p>
            <p className="text-xs text-warm-steel/40">PDF, JPG, PNG, WebP · Máx. {maxSizeMB}MB</p>
          </div>
        )}
      </div>

      {displayedError && (
        <div className="mt-2 flex items-center gap-1.5 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{displayedError}</span>
        </div>
      )}

      {currentFile && !displayedError && !uploading && (
        <div className="mt-2 flex items-center gap-1.5 text-green-600 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Archivo listo para enviar</span>
        </div>
      )}
    </div>
  );
}
