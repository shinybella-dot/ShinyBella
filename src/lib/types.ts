export interface Salon {
  id: string;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  telefono: string;
  rating: number;
  imagen_url: string | null;
  activo: boolean;
  created_at: string;
}

export interface Servicio {
  id: string;
  salon_id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  duracion_min: number;
  categoria: string;
  activo: boolean;
}

export interface Estilista {
  id: string;
  salon_id: string;
  nombre: string;
  especialidad: string | null;
  imagen_url: string | null;
  activo: boolean;
}

export interface Disponibilidad {
  id: string;
  estilista_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
}

export interface Reserva {
  id: string;
  user_id: string;
  salon_id: string;
  servicio_id: string;
  estilista_id: string;
  fecha: string;
  hora: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  payment_intent_id: string | null;
  created_at: string;
  salon?: Salon;
  servicio?: Servicio;
  estilista?: Estilista;
}

export interface UserProfile {
  id: string;
  email: string;
  nombre: string | null;
  telefono: string | null;
  created_at: string;
}

export type SalonCardProps = {
  salon: Salon;
  onClick: () => void;
};

export type ServiceCardProps = {
  servicio: Servicio;
  onSelect: () => void;
};