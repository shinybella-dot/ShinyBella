'use client';

import { useState, useMemo } from 'react';
import { Calendar, User, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Estilista } from '@/lib/types';

interface TimeSlotPickerProps {
  estilistas: Estilista[];
  onSelect: (estilistaId: string, fecha: Date, hora: string) => void;
  selectedEstilistaId: string | null;
  selectedFecha: Date | null;
  selectedHora: string | null;
  minDate?: Date;
}

const HORARIOS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
];

export default function TimeSlotPicker({
  estilistas,
  onSelect,
  selectedEstilistaId,
  selectedFecha,
  selectedHora,
  minDate = new Date(),
}: TimeSlotPickerProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(minDate, { weekStartsOn: 1 }));
  const [expandedEstilista, setExpandedEstilista] = useState<string | null>(null);

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(currentWeekStart, i));
    }
    return days;
  }, [currentWeekStart]);

  const isPastDate = (date: Date) => isBefore(startOfDay(date), startOfDay(minDate));

  const prevWeek = () => setCurrentWeekStart((prev) => addDays(prev, -7));
  const nextWeek = () => setCurrentWeekStart((prev) => addDays(prev, 7));

  const handleDayClick = (date: Date) => {
    if (isPastDate(date)) return;
    onSelect(selectedEstilistaId || estilistas[0]?.id || '', date, selectedHora || '09:00');
  };

  const handleTimeClick = (estilistaId: string, date: Date, hora: string) => {
    if (isPastDate(date)) return;
    onSelect(estilistaId, date, hora);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-concrete text-lg">Selecciona fecha y hora</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={prevWeek}
            disabled={isBefore(currentWeekStart, startOfWeek(minDate, { weekStartsOn: 1 }))}
            className="p-2 rounded-lg bg-white border border-warm-steel/20 hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Semana anterior"
          >
            <ChevronLeft className="w-5 h-5 text-concrete" aria-hidden="true" />
          </button>
          <span className="text-sm font-medium text-concrete w-40 text-center">
            {format(currentWeekStart, 'd MMM', { locale: es })} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'd MMM', { locale: es })}
          </span>
          <button
            onClick={nextWeek}
            className="p-2 rounded-lg bg-white border border-warm-steel/20 hover:bg-surface transition-colors"
            aria-label="Semana siguiente"
          >
            <ChevronRight className="w-5 h-5 text-concrete" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <table className="w-full min-w-[600px] border-collapse" role="grid" aria-label="Disponibilidad de horarios">
          <thead>
            <tr className="border-b border-warm-steel/20">
              <th className="text-left p-3 font-medium text-warm-steel/60 text-sm w-32">
                Estilista
              </th>
              {weekDays.map((day) => (
                <th key={day.toISOString()} className={`text-center p-3 font-medium text-sm ${
                  isSameDay(day, new Date()) ? 'text-accent' : 'text-warm-steel/60'
                }`}>
                  <div className="flex flex-col items-center gap-1">
                    <span>{format(day, 'EEE', { locale: es })}</span>
                    <span className={`font-semibold ${isSameDay(day, new Date()) ? 'text-accent' : 'text-concrete'}`}>
                      {format(day, 'd', { locale: es })}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {estilistas.map((estilista) => (
              <tr key={estilista.id} className="border-b border-warm-steel/10 last:border-0">
                <td className="p-3 w-32">
                  <button
                    onClick={() => setExpandedEstilista(expandedEstilista === estilista.id ? null : estilista.id)}
                    className="w-full flex items-center gap-2 text-left group"
                    aria-expanded={expandedEstilista === estilista.id}
                  >
                    <div className="w-8 h-8 rounded-full bg-surface-light flex items-center justify-center flex-shrink-0">
                      {estilista.imagen_url ? (
                        <img src={estilista.imagen_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-warm-steel/40" aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-concrete text-sm truncate">{estilista.nombre}</p>
                      {estilista.especialidad && (
                        <p className="text-warm-steel/60 text-xs truncate">{estilista.especialidad}</p>
                      )}
                    </div>
                  </button>
                </td>
                {weekDays.map((day) => (
                  <td key={`${estilista.id}-${day.toISOString()}`} className="p-1 text-center">
                    <div className="flex flex-col gap-1">
                      {HORARIOS.map((hora) => {
                        const isSelected = selectedEstilistaId === estilista.id &&
                                          selectedFecha &&
                                          isSameDay(selectedFecha, day) &&
                                          selectedHora === hora;
                        const isPast = isPastDate(day) || (isSameDay(day, new Date()) && isBefore(new Date(), parseISO(`${format(day, 'yyyy-MM-dd')}T${hora}`)));

                        return (
                          <button
                            key={hora}
                            onClick={() => !isPast && handleTimeClick(estilista.id, day, hora)}
                            disabled={isPast}
                            className={`w-full h-8 px-2 py-1 text-xs rounded-lg transition-all ${
                              isSelected
                                ? 'bg-accent text-white font-medium shadow-sm'
                                : isPast
                                ? 'bg-warm-steel/10 text-warm-steel/30 cursor-not-allowed line-through'
                                : 'bg-white border border-warm-steel/20 text-concrete hover:bg-surface hover:border-accent/50'
                            }`}
                            aria-pressed={isSelected ? 'true' : 'false'}
                            aria-disabled={isPast}
                            aria-label={`${format(day, 'EEEE d MMMM', { locale: es })} a las ${hora} con ${estilista.nombre}`}
                          >
                            {hora}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedFecha && selectedHora && selectedEstilistaId && (
        <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-accent" aria-hidden="true" />
            <div>
              <p className="font-medium text-concrete">
                {format(selectedFecha, 'EEEE d MMMM', { locale: es })} a las {selectedHora}
              </p>
              <p className="text-warm-steel/60 text-sm">
                Con {estilistas.find(e => e.id === selectedEstilistaId)?.nombre}
              </p>
            </div>
          </div>
          <Clock className="w-5 h-5 text-accent" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}