import { apiFetch } from './client';
import { TotemRecepcion } from './types';

interface TotemRecepcionDto {
  Codigo: number;
  Nombre: string;
}

export async function buscarTotemsRecepcion(sucursalId: number): Promise<TotemRecepcion[]> {
  const query = new URLSearchParams({ sucursal: String(sucursalId) });
  const data = await apiFetch<TotemRecepcionDto[]>(`/api/totems-recepcion?${query}`);
  return data.map((t) => ({ tot_id: t.Codigo, tot_nom: t.Nombre }));
}
