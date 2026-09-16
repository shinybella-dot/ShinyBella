'use client';

import { Servicio } from '@/lib/types';
import { Clock, Calendar, CheckCircle } from 'lucide-react';

interface ServiceCardProps {
  servicio: Servicio;
  isSelected: boolean;
  onClick: () => void;
}

export default function ServiceCard({ servicio, isSelected, onClick }: ServiceCardProps) {
  return (
    <article
      onClick={onClick}
      className={`relative cursor-pointer transition-all duration-200 rounded-xl border p-4 ${
        isSelected
          ? 'border-accent bg-accent/5 shadow-md ring-2 ring-accent/20'
          : 'border-warm-steel/20 bg-white hover:border-accent/50 hover:shadow-sm'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-pressed={isSelected}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-white" aria-hidden="true" />
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-concrete text-base">{servicio.nombre}</h4>
            <span className="font-bold text-lg text-primary flex-shrink-0">
              ${servicio.precio.toFixed(2)}
            </span>
          </div>

          {servicio.descripcion && (
            <p className="text-warm-steel/70 text-sm mt-1 line-clamp-2">{servicio.descripcion}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-3 text-warm-steel/60 text-xs">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {servicio.duracion_min} min
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              {servicio.categoria}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/5 transition-colors rounded-xl pointer-events-none" aria-hidden="true" />
    </article>
  );
}