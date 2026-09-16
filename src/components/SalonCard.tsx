'use client';

import { Salon } from '@/lib/types';
import { Star, MapPin, Phone, Clock, CheckCircle } from 'lucide-react';

interface SalonCardProps {
  salon: Salon;
  isSelected: boolean;
  onClick: () => void;
}

export default function SalonCard({ salon, isSelected, onClick }: SalonCardProps) {
  return (
    <article
      onClick={onClick}
      className={`relative group cursor-pointer transition-all duration-200 rounded-xl border p-4 ${
        isSelected
          ? 'border-accent bg-accent/5 shadow-lg ring-2 ring-accent/20'
          : 'border-warm-steel/20 bg-white hover:border-accent/50 hover:shadow-md'
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

      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-lg bg-surface-light flex items-center justify-center flex-shrink-0 overflow-hidden">
          {salon.imagen_url ? (
            <img
              src={salon.imagen_url}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <MapPin className="w-8 h-8 text-warm-steel/40" aria-hidden="true" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-concrete text-base truncate pr-2">{salon.nombre}</h3>
            <div className="flex items-center gap-1 text-amber-600 flex-shrink-0">
              <Star className="w-4 h-4 fill-current" aria-hidden="true" />
              <span className="font-medium text-sm">{salon.rating.toFixed(1)}</span>
            </div>
          </div>

          <p className="text-warm-steel/70 text-sm mt-1 line-clamp-1">{salon.direccion}</p>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-warm-steel/60 text-xs">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" aria-hidden="true" />
              {salon.telefono}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              Abierto ahora
            </span>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/5 transition-colors rounded-xl pointer-events-none" aria-hidden="true" />
    </article>
  );
}