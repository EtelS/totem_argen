import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SeleccionarTurno } from './SeleccionarTurno';
import { useAuthStore } from '../store/useAuthStore';
import { useTotemStore } from '../store/useTotemStore';
import { mockFetch, respuestaJson } from '../tests/fetchMock';

const PACIENTE = { dni: '30738807', nombreYApellido: 'Etel Perez', mutual: 'swiss medical' };
const TURNO_PARTICULAR = {
  codigo: 10,
  fecha: '29/09/2026',
  hora: '10:00',
  prestador: 'Diaz Carla',
  mutual: 'particular',
  autogestion: false, pideCodigoSeguridad: false,
};
const TURNO_MUTUAL = {
  codigo: 11,
  fecha: '29/09/2026',
  hora: '15:00',
  prestador: 'Romo Guillermo',
  mutual: 'swiss medical',
  autogestion: true, pideCodigoSeguridad: false,
};

function renderSeleccionarTurno() {
  render(
    <MemoryRouter initialEntries={['/seleccionar-turno']}>
      <Routes>
        <Route path="/seleccionar-turno" element={<SeleccionarTurno />} />
        <Route path="/confirmacion" element={<p>pantalla confirmacion</p>} />
        <Route path="/" element={<p>pantalla bienvenida</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('SeleccionarTurno', () => {
  beforeEach(() => {
    useAuthStore.setState({ usuario: 'eteltotem', token: 'jwt-123', sucursal: { suc_id: 16, suc_nom: 'clinicademo' } });
    useTotemStore.setState({
      dni: '30738807',
      seleccionTurno: { paciente: PACIENTE, turnos: [TURNO_PARTICULAR, TURNO_MUTUAL] },
      pendienteToken: null,
      confirmacion: null,
      contador: 0,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lista todos los turnos del dia con hora, prestador y mutual', () => {
    renderSeleccionarTurno();

    expect(screen.getByText('Elegi el turno a confirmar')).toBeInTheDocument();
    expect(screen.getByText('Etel Perez')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /10:00 - Diaz Carla/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /15:00 - Romo Guillermo/ })).toBeInTheDocument();
  });

  it('confirma en el backend el turno elegido cuando tiene mutual', async () => {
    const fetchMock = mockFetch(respuestaJson(200, { Mensaje: 'Turno confirmado' }));
    renderSeleccionarTurno();

    fireEvent.click(screen.getByRole('button', { name: /15:00 - Romo Guillermo/ }));

    expect(await screen.findByText('pantalla confirmacion')).toBeInTheDocument();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ Sucursal: 16, Dni: '30738807', TurnoCodigo: 11 });
    expect(useTotemStore.getState().confirmacion).toEqual({ tipo: 'turno', paciente: PACIENTE, turno: TURNO_MUTUAL });
    expect(useTotemStore.getState().seleccionTurno).toBeNull();
  });

  it('deriva a Recepcion con numero, sin confirmar en el backend, cuando la mutual del turno elegido no tiene autogestion', async () => {
    const fetchMock = mockFetch();
    renderSeleccionarTurno();

    fireEvent.click(screen.getByRole('button', { name: /10:00 - Diaz Carla/ }));

    expect(await screen.findByText('pantalla confirmacion')).toBeInTheDocument();
    expect(useTotemStore.getState().confirmacion).toEqual({ tipo: 'derivado', numero: 1, paciente: PACIENTE });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('vuelve al inicio si no hay turnos para elegir', () => {
    useTotemStore.setState({ seleccionTurno: null });
    renderSeleccionarTurno();

    expect(screen.getByText('pantalla bienvenida')).toBeInTheDocument();
  });
});
