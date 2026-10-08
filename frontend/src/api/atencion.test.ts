import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API_BASE_URL } from '../config';
import { buscarAtencion } from './atencion';
import { useAuthStore } from '../store/useAuthStore';
import { mockFetch, respuestaJson } from '../tests/fetchMock';

describe('buscarAtencion', () => {
  beforeEach(() => {
    useAuthStore.setState({ usuario: 'eteltotem', token: 'jwt-123', sucursal: { suc_id: 16, suc_nom: 'clinicademo' } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('envia sucursal, dni y el JWT, y mapea todos los turnos del dia', async () => {
    const fetchMock = mockFetch(
      respuestaJson(200, {
        Tipo: 'turnos',
        Paciente: { Codigo: 501, Dni: '30738807', NombreYApellido: 'Etel Perez', Mutual: 'SWISS MEDICAL' },
        Turnos: [
          { Codigo: 10, Fecha: '29/09/2026', Hora: '10:00', Prestador: 'Diaz Carla', Mutual: null, Autogestion: false, PideCodigoSeguridad: false },
          { Codigo: 11, Fecha: '29/09/2026', Hora: '15:00', Prestador: 'Romo Guillermo', Mutual: 'SWISS MEDICAL', Autogestion: true, PideCodigoSeguridad: false },
        ],
      }),
    );

    const resultado = await buscarAtencion(16, '30738807');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_BASE_URL}/api/atencion?sucursal=16&dni=30738807`);
    expect(init.headers.Authorization).toBe('Bearer jwt-123');
    expect(resultado).toEqual({
      tipo: 'turnos',
      paciente: { codigo: 501, dni: '30738807', nombreYApellido: 'Etel Perez', mutual: 'SWISS MEDICAL' },
      turnos: [
        { codigo: 10, fecha: '29/09/2026', hora: '10:00', prestador: 'Diaz Carla', mutual: '', autogestion: false, pideCodigoSeguridad: false },
        { codigo: 11, fecha: '29/09/2026', hora: '15:00', prestador: 'Romo Guillermo', mutual: 'SWISS MEDICAL', autogestion: true, pideCodigoSeguridad: false },
      ],
    });
  });

  it('deriva sin paciente cuando el DNI no se encuentra', async () => {
    mockFetch(respuestaJson(200, { Tipo: 'derivado', Paciente: null, Turnos: null }));

    expect(await buscarAtencion(16, '11111111')).toEqual({ tipo: 'derivado', paciente: undefined });
  });

  it('deriva con el nombre del paciente cuando no tiene turnos hoy', async () => {
    mockFetch(
      respuestaJson(200, {
        Tipo: 'derivado',
        Paciente: { Codigo: 502, Dni: '29712252', NombreYApellido: 'Mauro Herrera', Mutual: null },
        Turnos: null,
      }),
    );

    const resultado = await buscarAtencion(16, '29712252');

    expect(resultado.tipo).toBe('derivado');
    expect(resultado.paciente).toEqual({ codigo: 502, dni: '29712252', nombreYApellido: 'Mauro Herrera', mutual: '' });
  });

  it('cierra la sesion del totem cuando el backend rechaza el token', async () => {
    mockFetch(respuestaJson(401, { mensaje: 'Token inválido: Token expirado' }));

    await expect(buscarAtencion(16, '30738807')).rejects.toMatchObject({ status: 401 });
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().sucursal).toBeNull();
  });
});
