import { formatearFecha, Paciente, PACIENTES_MOCK, Turno, TURNOS_MOCK } from './data';

export type ResultadoAtencion =
  | { tipo: 'turno'; paciente: Paciente; turno: Turno }
  | { tipo: 'derivado'; paciente?: Paciente };

/**
 * Pacientes particulares, DNIs sin turno para el dia de hoy y DNIs no
 * encontrados se derivan a Recepcion con un numero de orden (ver
 * Bienvenida). Solo los pacientes con turno hoy y mutual/obra social
 * confirman turno directamente en el totem. Si el DNI pertenece a un
 * paciente conocido, se incluye para mostrar su nombre aunque se lo derive.
 */
export function buscarAtencion(dni: string): ResultadoAtencion {
  const paciente = PACIENTES_MOCK.find((p) => p.dni === dni);
  if (!paciente || paciente.mutual.trim().toLowerCase() === 'particular') {
    return { tipo: 'derivado', paciente };
  }

  const hoy = formatearFecha(new Date());
  const turno = TURNOS_MOCK.find((t) => t.pacienteDni === dni && t.fecha === hoy);
  if (!turno) {
    return { tipo: 'derivado', paciente };
  }

  return { tipo: 'turno', paciente, turno };
}
