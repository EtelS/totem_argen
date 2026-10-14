import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API_BASE_URL } from '../config';
import { buscarTotemsRecepcion } from './totemsRecepcion';
import { useAuthStore } from '../store/useAuthStore';
import { mockFetch, respuestaJson } from '../tests/fetchMock';

describe('buscarTotemsRecepcion', () => {
  beforeEach(() => {
    useAuthStore.setState({ usuario: 'eteltotem', token: 'jwt-123', sucursal: { suc_id: 16, suc_nom: 'clinicademo' } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('envia la sucursal y el JWT, y mapea los totems de recepcion', async () => {
    const fetchMock = mockFetch(
      respuestaJson(200, [
        { Codigo: 3, Nombre: 'Totem entrada' },
        { Codigo: 4, Nombre: 'Totem guardia' },
      ]),
    );

    const totems = await buscarTotemsRecepcion(16);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_BASE_URL}/api/totems-recepcion?sucursal=16`);
    expect(init.headers.Authorization).toBe('Bearer jwt-123');
    expect(totems).toEqual([
      { tot_id: 3, tot_nom: 'Totem entrada' },
      { tot_id: 4, tot_nom: 'Totem guardia' },
    ]);
  });
});
