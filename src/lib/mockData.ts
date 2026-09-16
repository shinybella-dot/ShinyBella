import { Salon, Servicio, Estilista } from './types';

export type { Salon, Servicio, Estilista } from './types';

export const mockSalones: Salon[] = [
  {
    id: '1',
    nombre: 'Bella Vista Salon',
    direccion: 'Calle Principal #123, Santa Ana Centro',
    lat: 13.9941,
    lng: -89.5557,
    telefono: '+503 2200-1111',
    rating: 4.8,
    imagen_url: null,
    activo: true,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    nombre: 'Barbería El Clásico',
    direccion: 'Av. Independencia #45, Santa Ana',
    lat: 13.9915,
    lng: -89.5521,
    telefono: '+503 2200-2222',
    rating: 4.9,
    imagen_url: null,
    activo: true,
    created_at: '2024-01-20T10:00:00Z',
  },
  {
    id: '3',
    nombre: 'Nails & Spa Glow',
    direccion: 'Centro Comercial Metrocentro, Local 12',
    lat: 13.9968,
    lng: -89.5589,
    telefono: '+503 2200-3333',
    rating: 4.7,
    imagen_url: null,
    activo: true,
    created_at: '2024-02-01T10:00:00Z',
  },
  {
    id: '4',
    nombre: 'Estética María José',
    direccion: 'Col. Escalón, Pasaje 5 #10',
    lat: 13.9889,
    lng: -89.5498,
    telefono: '+503 2200-4444',
    rating: 4.6,
    imagen_url: null,
    activo: true,
    created_at: '2024-02-10T10:00:00Z',
  },
  {
    id: '5',
    nombre: 'The Gentleman\'s Cut',
    direccion: 'Blvd. Los Próceres #200',
    lat: 13.9992,
    lng: -89.5623,
    telefono: '+503 2200-5555',
    rating: 4.9,
    imagen_url: null,
    activo: true,
    created_at: '2024-02-15T10:00:00Z',
  },
];

export const mockServicios: Servicio[] = [
  { id: 's1', salon_id: '1', nombre: 'Corte de cabello', descripcion: 'Corte moderno con lavado y peinado incluido', precio: 15.00, duracion_min: 45, categoria: 'Cabello', activo: true },
  { id: 's2', salon_id: '1', nombre: 'Tinte completo', descripcion: 'Coloración profesional con tratamiento hidratante', precio: 35.00, duracion_min: 90, categoria: 'Cabello', activo: true },
  { id: 's3', salon_id: '1', nombre: 'Manicure spa', descripcion: 'Limpieza, exfoliación, mascarilla y esmaltado', precio: 18.00, duracion_min: 60, categoria: 'Uñas', activo: true },
  { id: 's4', salon_id: '1', nombre: 'Pedicure spa', descripcion: 'Tratamiento completo de pies con masaje relajante', precio: 22.00, duracion_min: 75, categoria: 'Uñas', activo: true },
  { id: 's5', salon_id: '1', nombre: 'Maquillaje social', descripcion: 'Maquillaje para eventos con productos de alta gama', precio: 25.00, duracion_min: 60, categoria: 'Maquillaje', activo: true },

  { id: 's6', salon_id: '2', nombre: 'Corte clásico', descripcion: 'Corte tradicional con navaja y toalla caliente', precio: 12.00, duracion_min: 30, categoria: 'Barbería', activo: true },
  { id: 's7', salon_id: '2', nombre: 'Corte + Barba', descripcion: 'Corte de cabello y arreglo de barba completo', precio: 18.00, duracion_min: 45, categoria: 'Barbería', activo: true },
  { id: 's8', salon_id: '2', nombre: 'Afeitado tradicional', descripcion: 'Afeitado con navaja, toallas calientes y bálsamo', precio: 15.00, duracion_min: 30, categoria: 'Barbería', activo: true },

  { id: 's9', salon_id: '3', nombre: 'Manicure gel', descripcion: 'Esmaltado en gel de larga duración', precio: 20.00, duracion_min: 45, categoria: 'Uñas', activo: true },
  { id: 's10', salon_id: '3', nombre: 'Pedicure gel', descripcion: 'Esmaltado en gel para pies', precio: 25.00, duracion_min: 60, categoria: 'Uñas', activo: true },
  { id: 's11', salon_id: '3', nombre: 'Extensiones de pestañas', descripcion: 'Pestañas pelo a pelo, efecto natural', precio: 45.00, duracion_min: 90, categoria: 'Pestañas', activo: true },

  { id: 's12', salon_id: '4', nombre: 'Limpieza facial profunda', descripcion: 'Limpieza, extracción, mascarilla y masaje', precio: 30.00, duracion_min: 75, categoria: 'Facial', activo: true },
  { id: 's13', salon_id: '4', nombre: 'Tratamiento anti-edad', descripcion: 'Radiofrecuencia + sérums especializados', precio: 55.00, duracion_min: 60, categoria: 'Facial', activo: true },
  { id: 's14', salon_id: '4', nombre: 'Depilación láser (axilas)', descripcion: 'Sesión individual de depilación definitiva', precio: 25.00, duracion_min: 20, categoria: 'Depilación', activo: true },

  { id: 's15', salon_id: '5', nombre: 'Corte premium', descripcion: 'Corte personalizado con asesoría de imagen', precio: 22.00, duracion_min: 45, categoria: 'Barbería', activo: true },
  { id: 's16', salon_id: '5', nombre: 'Barba diseño', descripcion: 'Diseño y perfilado de barba con navaja', precio: 15.00, duracion_min: 30, categoria: 'Barbería', activo: true },
  { id: 's17', salon_id: '5', nombre: 'Tratamiento capilar', descripcion: 'Hidratación profunda + masaje craneal', precio: 18.00, duracion_min: 30, categoria: 'Cabello', activo: true },
];

export const mockEstilistas: Estilista[] = [
  { id: 'e1', salon_id: '1', nombre: 'Ana Martínez', especialidad: 'Colorimetría y cortes modernos', imagen_url: null, activo: true },
  { id: 'e2', salon_id: '1', nombre: 'Carlos Rodríguez', especialidad: 'Barbería y cortes masculinos', imagen_url: null, activo: true },
  { id: 'e3', salon_id: '1', nombre: 'Laura Gómez', especialidad: 'Uñas y spa de manos/pies', imagen_url: null, activo: true },

  { id: 'e4', salon_id: '2', nombre: 'Roberto Díaz', especialidad: 'Barbería clásica y afeitado', imagen_url: null, activo: true },
  { id: 'e5', salon_id: '2', nombre: 'Miguel Torres', especialidad: 'Cortes fade y diseños', imagen_url: null, activo: true },

  { id: 'e6', salon_id: '3', nombre: 'Sofía Herrera', especialidad: 'Uñas gel y nail art', imagen_url: null, activo: true },
  { id: 'e7', salon_id: '3', nombre: 'Valentina Cruz', especialidad: 'Pestañas y cejas', imagen_url: null, activo: true },

  { id: 'e8', salon_id: '4', nombre: 'María José López', especialidad: 'Estética facial y corporal', imagen_url: null, activo: true },
  { id: 'e9', salon_id: '4', nombre: 'Andrea Morales', especialidad: 'Depilación láser y fotodepilación', imagen_url: null, activo: true },

  { id: 'e10', salon_id: '5', nombre: 'Javier Castillo', especialidad: 'Cortes premium y asesoría', imagen_url: null, activo: true },
  { id: 'e11', salon_id: '5', nombre: 'Andrés Vega', especialidad: 'Barbería artística y tratamientos', imagen_url: null, activo: true },
];

export function getSalonById(id: string): Salon | undefined {
  return mockSalones.find((s) => s.id === id);
}

export function getServiciosBySalon(salonId: string): Servicio[] {
  return mockServicios.filter((s) => s.salon_id === salonId && s.activo);
}

export function getEstilistasBySalon(salonId: string): Estilista[] {
  return mockEstilistas.filter((e) => e.salon_id === salonId && e.activo);
}

export function getServicioById(id: string): Servicio | undefined {
  return mockServicios.find((s) => s.id === id);
}

export function getEstilistaById(id: string): Estilista | undefined {
  return mockEstilistas.find((e) => e.id === id);
}