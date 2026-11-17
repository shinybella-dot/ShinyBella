import { z } from 'zod';

export const tiposNegocio = [
  'Salón de belleza',
  'Barbería',
  'Spa',
  'Estética',
  'Estudio de uñas',
  'Otro',
] as const;

export const rangosEstilistas = ['1-3', '4-10', '11-20', '20+'] as const;

const latSchema = z.number().min(-90, 'Latitud inválida').max(90, 'Latitud inválida').nullable().optional();
const lngSchema = z.number().min(-180, 'Longitud inválida').max(180, 'Longitud inválida').nullable().optional();

export const paso1Schema = z.object({
  nombreSalon: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  tipo: z.enum(tiposNegocio, { message: 'Selecciona un tipo válido' }),
  direccion: z.string().min(5, 'Dirección muy corta').max(200),
  telefono: z.string().regex(/^[+0-9\s()-]{8,}$/, 'Teléfono inválido (mín. 8 dígitos)'),
  email: z.string().email('Email inválido'),
  descripcion: z.string().max(500).optional(),
  horario: z.string().max(100).optional(),
  lat: latSchema,
  lng: lngSchema,
});

export const paso2Schema = z.object({
  responsable: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  dui_nit: z.string().min(5, 'DUI/NIT muy corto').max(20).regex(/^[0-9-]+$/, 'Solo números y guiones'),
  cargo: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  email: z.string().email('Email inválido'),
  telefono: z.string().regex(/^[+0-9\s()-]{8,}$/, 'Teléfono inválido (mín. 8 dígitos)'),
});

// Los campos *_url conservan su nombre por compatibilidad, pero contienen paths de Storage.
export const paso3Schema = z.object({
  dui_url: z.string().max(500).optional(),
  patente_url: z.string().max(500).optional(),
  selfie_url: z.string().max(500).optional(),
});

export const wizardSchema = paso1Schema.merge(paso2Schema).merge(paso3Schema);

export type Paso1Data = z.infer<typeof paso1Schema>;
export type Paso2Data = z.infer<typeof paso2Schema>;
export type Paso3Data = z.infer<typeof paso3Schema>;
export type WizardData = z.infer<typeof wizardSchema>;
