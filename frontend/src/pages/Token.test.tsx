import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Token } from './Token';
import { useAuthStore } from '../store/useAuthStore';
import { useTotemStore } from '../store/useTotemStore';
import { mockFetch, respuestaJson } from '../tests/fetchMock';

const PACIENTE = { dni: '30738807', nombreYApellido: 'Etel Perez', mutual: 'swiss medical', token: '123' };
const TURNO = { codigo: 1, fecha: '17/09/2026', hora: '15:00', prestador: 'Romo Guillermo', mutual: 'swiss medical', particular: false };

function ingresarDigitos(digitos: string) {
  digitos.split('').forEach((digito) => {
    fireEvent.click(screen.getByRole('button', { name: `Digito ${digito}` }));
  });
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

  it('confirma el turno en el backend cuando el token coincide', async () => {
    const fetchMock = mockFetch(respuestaJson(200, { Mensaje: 'Turno confirmado' }));
    render(
      <MemoryRouter>
        <Token />
      </MemoryRouter>,
    );

    ingresarDigitos('123');
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    await waitFor(() => {
      expect(useTotemStore.getState().confirmacion).toEqual({ tipo: 'turno', paciente: PACIENTE, turno: TURNO });
    });
    expect(useTotemStore.getState().pendienteToken).toBeNull();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ Sucursal: 16, Dni: '30738807', TurnoCodigo: 1 });
  });

  it('da una segunda oportunidad cuando el token no coincide la primera vez', async () => {
    mockFetch(respuestaJson(200, { Mensaje: 'Turno confirmado' }));
    render(
      <MemoryRouter>
        <Token />
      </MemoryRouter>,
    );

    ingresarDigitos('999');
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(screen.getByText('Token incorrecto. Intenta nuevamente.')).toBeInTheDocument();
    expect(useTotemStore.getState().confirmacion).toBeNull();

    ingresarDigitos('123');
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    await waitFor(() => {
      expect(useTotemStore.getState().confirmacion).toEqual({ tipo: 'turno', paciente: PACIENTE, turno: TURNO });
    });
  });

  it('deriva a Recepcion con numero cuando el token falla dos veces', () => {
    render(
      <MemoryRouter>
        <Token />
      </MemoryRouter>,
    );

    ingresarDigitos('999');
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    ingresarDigitos('888');
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(useTotemStore.getState().confirmacion).toEqual({ tipo: 'derivado', numero: 1, paciente: PACIENTE });
    expect(useTotemStore.getState().pendienteToken).toBeNull();
  });
});
