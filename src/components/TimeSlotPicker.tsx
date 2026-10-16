'use client';

import { useState, useMemo, useEffect } from 'react';
import { Calendar, User, ChevronLeft, ChevronRight, Clock, Lock } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Estilista } from '@/lib/types';

interface TimeSlotPickerProps {
  estilistas: Estilista[];
  onSelect: (estilistaId: string, fecha: Date, hora: string) => void;
  selectedEstilistaId: string | null;
  selectedFecha: Date | null;
  selectedHora: string | null;
  minDate?: Date;
  bookedSlots?: Record<string, string[]>; // estilista_id -> array de horas "HH:MM"
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
  bookedSlots = {},
}: TimeSlotPickerProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(minDate, { weekStartsOn: 1 }));
  const [expandedEstilista, setExpandedEstilista] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Estados locales de la vista móvil (se confirman al tocar una hora)
  const [mobileDay, setMobileDay] = useState<Date | null>(null);
  const [mobileEstilistaId, setMobileEstilistaId] = useState<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(currentWeekStart, i));
    }
    return days;
  }, [currentWeekStart]);

  const isPastDate = (date: Date) => isBefore(startOfDay(date), startOfDay(minDate));

  const isPastTime = (date: Date, hora: string) => {
    if (!isSameDay(date, new Date())) return false;
    const [hours, minutes] = hora.split(':').map(Number);
    const now = new Date();
    const slotTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    return isBefore(slotTime, now);
  };

  const prevWeek = () => setCurrentWeekStart((prev) => addDays(prev, -7));
  const nextWeek = () => setCurrentWeekStart((prev) => addDays(prev, 7));

  const handleDayClick = (date: Date) => {
    if (isPastDate(date)) return;
    const firstEstilistaId = estilistas[0]?.id;
    if (!firstEstilistaId) return;
    onSelect(firstEstilistaId, date, selectedHora || '09:00');
  };

  const handleTimeClick = (estilistaId: string, date: Date, hora: string) => {
    if (isPastDate(date)) return;
    onSelect(estilistaId, date, hora);
  };

  const isSlotBooked = (estilistaId: string, hora: string) => {
    return bookedSlots[estilistaId]?.includes(hora) ?? false;
  };

  const weekContains = (d: Date | null | undefined) =>
    !!d && weekDays.some((w) => isSameDay(w, d));

  // ====== VISTA MÓVIL: día + estilista + grid de horas (sin tabla ancha) ======
  if (isMobile) {
    const defaultDay =
      weekDays.find((d) => !isPastDate(d)) ||
      weekDays.find((d) => isSameDay(d, startOfDay(minDate))) ||
      weekDays[0];

    const activeDay = weekContains(mobileDay)
      ? mobileDay!
      : weekContains(selectedFecha)
      ? selectedFecha!
      : defaultDay;

    const activeEstilistaId =
      mobileEstilistaId && estilistas.some((e) => e.id === mobileEstilistaId)
        ? mobileEstilistaId
        : selectedEstilistaId && estilistas.some((e) => e.id === selectedEstilistaId)
        ? selectedEstilistaId
        : estilistas[0]?.id;

    if (estilistas.length === 0) {
      return (
        <div className="text-center py-8">
          <User className="w-10 h-10 text-warm-steel/30 mx-auto mb-3" aria-hidden="true" />
          <p className="text-warm-steel/60 text-sm">
            Este salón no tiene estilistas disponibles aún
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-concrete text-base">Fecha y hora</h3>
          <div className="flex items-center gap-1.5">
            <button
              onClick={prevWeek}
              disabled={isBefore(currentWeekStart, startOfWeek(minDate, { weekStartsOn: 1 }))}
              className="p-1.5 rounded-lg bg-white border border-warm-steel/20 hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Semana anterior"
            >
              <ChevronLeft className="w-4 h-4 text-concrete" aria-hidden="true" />
            </button>
            <span className="text-xs font-medium text-concrete text-center px-1 whitespace-nowrap">
              {format(currentWeekStart, 'd MMM', { locale: es })} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'd MMM', { locale: es })}
            </span>
            <button
              onClick={nextWeek}
              className="p-1.5 rounded-lg bg-white border border-warm-steel/20 hover:bg-surface transition-colors"
              aria-label="Semana siguiente"
            >
              <ChevronRight className="w-4 h-4 text-concrete" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Selector de día: 7 chips en una fila, sin scroll horizontal */}
        <div className="grid grid-cols-7 gap-1.5" role="group" aria-label="Selecciona el día">
          {weekDays.map((day) => {
            const past = isPastDate(day);
            const active = isSameDay(day, activeDay);
            const today = isSameDay(day, new Date());
            return (
              <button
                key={day.toISOString()}
                onClick={() => !past && setMobileDay(day)}
                disabled={past}
                className={`flex flex-col items-center justify-center py-2 rounded-xl border transition-all ${
                  active
                    ? 'bg-accent text-white border-accent shadow-sm'
                    : past
                    ? 'bg-warm-steel/10 text-warm-steel/30 border-transparent cursor-not-allowed'
                    : 'bg-white text-concrete border-warm-steel/20 hover:border-accent/50'
                }`}
                aria-pressed={active ? 'true' : 'false'}
                aria-label={format(day, 'EEEE d MMMM', { locale: es })}
              >
                <span className={`text-[10px] uppercase font-medium ${active ? 'text-white/80' : today ? 'text-accent' : 'text-warm-steel/60'}`}>
                  {format(day, 'EEE', { locale: es })}
                </span>
                <span className={`text-sm font-semibold ${active ? 'text-white' : today ? 'text-accent' : 'text-concrete'}`}>
                  {format(day, 'd')}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selector de estilista */}
        {estilistas.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="group" aria-label="Selecciona el estilista">
            {estilistas.map((estilista) => {
              const active = estilista.id === activeEstilistaId;
              return (
                <button
                  key={estilista.id}
                  onClick={() => setMobileEstilistaId(estilista.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all flex-shrink-0 ${
                    active
                      ? 'bg-accent/10 border-accent text-concrete'
                      : 'bg-white border-warm-steel/20 text-warm-steel/70'
                  }`}
                  aria-pressed={active ? 'true' : 'false'}
                >
                  <div className="w-6 h-6 rounded-full bg-surface-light flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {estilista.imagen_url ? (
                      <img src={estilista.imagen_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-warm-steel/40" aria-hidden="true" />
                    )}
                  </div>
                  <span className="text-xs font-medium whitespace-nowrap">{estilista.nombre}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Grid de horarios: siempre cabe en pantalla */}
        <div className="grid grid-cols-4 gap-2" role="group" aria-label="Horarios disponibles">
          {HORARIOS.map((hora) => {
            const isSelected =
              selectedEstilistaId === activeEstilistaId &&
              selectedFecha &&
              isSameDay(selectedFecha, activeDay) &&
              selectedHora === hora;
            const isPast = isPastDate(activeDay) || isPastTime(activeDay, hora);
            const isBooked = activeEstilistaId ? isSlotBooked(activeEstilistaId, hora) : false;

            return (
              <button
                key={hora}
                onClick={() => !isPast && !isBooked && activeEstilistaId && handleTimeClick(activeEstilistaId, activeDay, hora)}
                disabled={isPast || isBooked || !activeEstilistaId}
                className={`h-10 text-sm rounded-lg transition-all flex items-center justify-center gap-1 font-medium ${
                  isSelected
                    ? 'bg-accent text-white shadow-sm'
                    : isPast
                    ? 'bg-warm-steel/10 text-warm-steel/30 cursor-not-allowed line-through'
                    : isBooked
                    ? 'bg-red-50 text-red-500 border border-red-200 cursor-not-allowed'
                    : 'bg-white border border-warm-steel/20 text-concrete active:bg-surface'
                }`}
                aria-pressed={isSelected ? 'true' : 'false'}
                aria-disabled={isPast || isBooked}
                aria-label={`${isBooked ? 'Ocupado - ' : ''}${hora}`}
              >
                {hora}
                {isBooked && <Lock className="w-3 h-3" aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        {selectedFecha && selectedHora && selectedEstilistaId && (
          <div className="p-3 bg-accent/5 border border-accent/20 rounded-xl flex items-center gap-3">
            <Calendar className="w-5 h-5 text-accent flex-shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-medium text-concrete text-sm">
                {format(selectedFecha, 'EEEE d MMMM', { locale: es })} a las {selectedHora}
              </p>
              <p className="text-warm-steel/60 text-xs truncate">
                Con {estilistas.find((e) => e.id === selectedEstilistaId)?.nombre}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ====== VISTA DESKTOP: tabla completa ======
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
                        const isPast = isPastDate(day) || isPastTime(day, hora);
                        const isBooked = isSlotBooked(estilista.id, hora);

                        return (
                          <button
                            key={hora}
                            onClick={() => !isPast && !isBooked && handleTimeClick(estilista.id, day, hora)}
                            disabled={isPast || isBooked}
                            className={`w-full h-8 px-2 py-1 text-xs rounded-lg transition-all flex items-center justify-center gap-1 ${
                              isSelected
                                ? 'bg-accent text-white font-medium shadow-sm'
                                : isPast
                                ? 'bg-warm-steel/10 text-warm-steel/30 cursor-not-allowed line-through'
                                : isBooked
                                ? 'bg-red-50 text-red-500 border border-red-200 cursor-not-allowed'
                                : 'bg-white border border-warm-steel/20 text-concrete hover:bg-surface hover:border-accent/50'
                            }`}
                            aria-pressed={isSelected ? 'true' : 'false'}
                            aria-disabled={isPast || isBooked}
                            aria-label={`${isBooked ? 'Ocupado - ' : ''}${format(day, 'EEEE d MMMM', { locale: es })} a las ${hora} con ${estilista.nombre}`}
                          >
                            {hora}
                            {isBooked && <Lock className="w-3 h-3" aria-hidden="true" />}
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