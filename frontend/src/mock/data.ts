export interface Turno {
  fecha: string;
  hora: string;
  prestador: string;
  pacienteDni: string;
}

export interface Paciente {
  dni: string;
  nombreYApellido: string;
  mutual: string;
  token: string;
}

/** Formatea una fecha como dd/mm/aaaa, igual que los datos mock de turnos. */
export function formatearFecha(fecha: Date): string {
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

export const TURNOS_MOCK: Turno[] = [
  { fecha: formatearFecha(new Date()), hora: '15:00', prestador: 'Romo Guillermo', pacienteDni: '30738807' },
  { fecha: '17/09/2026', hora: '15:30', prestador: 'Romo Guillermo', pacienteDni: '29712252' },
  { fecha: '01/01/2026', hora: '10:00', prestador: 'Diaz Carla', pacienteDni: '31234567' },
];

export const PACIENTES_MOCK: Paciente[] = [
  { dni: '30738807', nombreYApellido: 'Etel Perez', mutual: 'swiss medical', token: '123' },
  { dni: '29712252', nombreYApellido: 'Mauro Herrera', mutual: 'particular', token: '' },
  { dni: '31234567', nombreYApellido: 'Carlos Gimenez', mutual: 'osde', token: '' },
];
