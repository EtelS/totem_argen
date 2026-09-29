import { apiFetch } from './client';
import { Paciente, Turno } from './types';

interface TurnoDto {
  Codigo: number;
  Fecha: string;
  Hora: string;
  Prestador: string;
  Mutual: string | null;
  Particular: boolean;
}

interface AtencionResponseDto {
  Tipo: 'turnos' | 'derivado';
  Paciente: { Dni: string; NombreYApellido: string; Mutual: string | null } | null;
  Turnos: TurnoDto[] | null;
}

export type ResultadoAtencion =
  | { tipo: 'turnos'; paciente: Paciente; turnos: Turno[] }
  | { tipo: 'derivado'; paciente?: Paciente };

export async function buscarAtencion(sucursalId: number, dni: string): Promise<ResultadoAtencion> {
  const query = new URLSearchParams({ sucursal: String(sucursalId), dni });
  const data = await apiFetch<AtencionResponseDto>(`/api/atencion?${query}`);

  const paciente: Paciente | undefined = data.Paciente
    ? { dni: data.Paciente.Dni, nombreYApellido: data.Paciente.NombreYApellido, mutual: data.Paciente.Mutual ?? '' }
    : undefined;

  if (data.Tipo === 'turnos' && paciente && data.Turnos && data.Turnos.length > 0) {
    return {
      tipo: 'turnos',
      paciente,
      turnos: data.Turnos.map((t) => ({
        codigo: t.Codigo,
        fecha: t.Fecha,
        hora: t.Hora,
        prestador: t.Prestador,
        mutual: t.Mutual ?? '',
        particular: t.Particular,
      })),
    };
  }

  return { tipo: 'derivado', paciente };
}

export async function confirmarTurno(sucursalId: number, dni: string, turnoCodigo: number): Promise<void> {
  await apiFetch('/api/atencion/confirmar', {
    method: 'POST',
    body: { Sucursal: sucursalId, Dni: dni, TurnoCodigo: turnoCodigo },
  });
}
