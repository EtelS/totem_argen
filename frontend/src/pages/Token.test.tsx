import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Token } from './Token';
import { useAuthStore } from '../store/useAuthStore';
import { useTotemStore } from '../store/useTotemStore';
import { mockFetch, respuestaJson } from '../tests/fetchMock';

const PACIENTE = { dni: '30738807', nombreYApellido: 'Etel Perez', mutual: 'swiss medical' };
const TURNO = {
  codigo: 1,
  fecha: '17/09/2026',
  hora: '15:00',
  prestador: 'Romo Guillermo',
  mutual: 'swiss medical',
  autogestion: true,
  pideCodigoSeguridad: true,
};

function ingresarDigitos(digitos: string) {
  digitos.split('').forEach((digito) => {
    fireEvent.click(screen.getByRole('button', { name: `Digito ${digito}` }));
  });
}

function renderToken() {
  render(
    <MemoryRouter>
      <Token />
    </MemoryRouter>,
  );
}

describe('Token', () => {
  beforeEach(() => {
    useAuthStore.setState({ usuario: 'eteltotem', token: 'jwt-123', sucursal: { suc_id: 16, suc_nom: 'clinicademo' } });
    useTotemStore.setState({
      dni: '30738807',
      pendienteToken: { paciente: PACIENTE, turno: TURNO },
      confirmacion: null,
      contador: 0,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('confirma el turno en el backend con cualquier token ingresado (todavia no se valida)', async () => {
    const fetchMock = mockFetch(respuestaJson(200, { Mensaje: 'Turno confirmado' }));
    renderToken();

    ingresarDigitos('4567');
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    await waitFor(() => {
      expect(useTotemStore.getState().confirmacion).toEqual({ tipo: 'turno', paciente: PACIENTE, turno: TURNO });
    });
    expect(useTotemStore.getState().pendienteToken).toBeNull();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ Sucursal: 16, Dni: '30738807', TurnoCodigo: 1 });
  });

  it('pide ingresar el token cuando se continua sin cargarlo', () => {
    const fetchMock = mockFetch();
    renderToken();

    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(screen.getByText('Ingresa el token de tu mutual')).toBeInTheDocument();
    expect(useTotemStore.getState().confirmacion).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
