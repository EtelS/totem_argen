import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Confirmacion } from './Confirmacion';
import { useTotemStore } from '../store/useTotemStore';

describe('Confirmacion', () => {
  beforeEach(() => {
    useTotemStore.setState({ dni: null, confirmacion: null });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('limpia la seleccion de turno y el token pendiente al mostrarse', () => {
    const paciente = { codigo: 501, dni: '30738807', nombreYApellido: 'Etel Perez', mutual: 'swiss medical' };
    const turno = { codigo: 1, fecha: '17/09/2026', hora: '15:00', prestador: 'Romo Guillermo', mutual: 'swiss medical', autogestion: true, pideCodigoSeguridad: true };
    useTotemStore.setState({
      seleccionTurno: { paciente, turnos: [turno] },
      pendienteToken: { paciente, turno, numero: 7 },
      confirmacion: { tipo: 'turno', numero: 7, paciente, turno },
    });

    render(
      <MemoryRouter>
        <Confirmacion />
      </MemoryRouter>,
    );

    expect(screen.getByText('Turno confirmado')).toBeInTheDocument();
    expect(useTotemStore.getState().seleccionTurno).toBeNull();
    expect(useTotemStore.getState().pendienteToken).toBeNull();
  });

  it('muestra los datos del turno y el numero asignado cuando el turno se confirmo', () => {
    useTotemStore.setState({
      dni: '30738807',
      confirmacion: {
        tipo: 'turno',
        numero: 7,
        paciente: { codigo: 501, dni: '30738807', nombreYApellido: 'Etel Perez', mutual: 'swiss medical' },
        turno: { codigo: 1, fecha: '17/09/2026', hora: '15:00', prestador: 'Romo Guillermo', mutual: 'swiss medical', autogestion: true, pideCodigoSeguridad: false },
      },
    });

    render(
      <MemoryRouter>
        <Confirmacion />
      </MemoryRouter>,
    );

    expect(screen.getByText('Turno confirmado')).toBeInTheDocument();
    expect(screen.getByText('Etel Perez')).toBeInTheDocument();
    expect(screen.getByText('Prestador: Romo Guillermo')).toBeInTheDocument();
    expect(screen.getByText('Hora: 15:00')).toBeInTheDocument();
    expect(screen.getByText('Tu numero es')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.queryByText(/Token/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Imprimir ticket' })).toBeInTheDocument();
  });

  it('muestra el nombre y avisa que sera atendido en Recepcion cuando el paciente es conocido', () => {
    useTotemStore.setState({
      dni: '29712252',
      confirmacion: {
        tipo: 'derivado',
        numero: 1,
        paciente: { codigo: 502, dni: '29712252', nombreYApellido: 'Mauro Herrera', mutual: 'particular' },
      },
    });

    render(
      <MemoryRouter>
        <Confirmacion />
      </MemoryRouter>,
    );

    expect(screen.getByText('Numero asignado')).toBeInTheDocument();
    expect(screen.getByText('Mauro Herrera')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText(/atendido\/a en Recepcion/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Imprimir ticket' })).toBeInTheDocument();
  });

  it('muestra el numero asignado sin nombre cuando el DNI no se encuentra en la data mock', () => {
    useTotemStore.setState({
      dni: '11111111',
      confirmacion: { tipo: 'derivado', numero: 2 },
    });

    render(
      <MemoryRouter>
        <Confirmacion />
      </MemoryRouter>,
    );

    expect(screen.getByText('Numero asignado')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/atendido\/a en Recepcion/)).toBeInTheDocument();
    expect(screen.queryByText(/^Prestador:/)).not.toBeInTheDocument();
  });

  it('muestra los datos del turno elegido como un turno confirmado cuando se deriva a Recepcion', () => {
    useTotemStore.setState({
      dni: '29712252',
      confirmacion: {
        tipo: 'derivado',
        numero: 5,
        paciente: { codigo: 502, dni: '29712252', nombreYApellido: 'GUILLERMO DANIEL ROMO', mutual: 'particular' },
        turno: { codigo: 3, fecha: '09/10/2026', hora: '08:00', prestador: 'Herrera Mauro', mutual: 'particular', autogestion: false, pideCodigoSeguridad: false },
      },
    });

    render(
      <MemoryRouter>
        <Confirmacion />
      </MemoryRouter>,
    );

    expect(screen.getByText('GUILLERMO DANIEL ROMO')).toBeInTheDocument();
    expect(screen.getByText('Prestador: Herrera Mauro')).toBeInTheDocument();
    expect(screen.getByText('Fecha: 09/10/2026')).toBeInTheDocument();
    expect(screen.getByText('Hora: 08:00')).toBeInTheDocument();
    expect(screen.getByText('Mutual: particular')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('vuelve al inicio y limpia los datos despues de 7 segundos', () => {
    vi.useFakeTimers();
    useTotemStore.setState({ dni: '11111111', confirmacion: { tipo: 'derivado', numero: 2 } });

    render(
      <MemoryRouter initialEntries={['/confirmacion']}>
        <Routes>
          <Route path="/confirmacion" element={<Confirmacion />} />
          <Route path="/" element={<p>pantalla bienvenida</p>} />
        </Routes>
      </MemoryRouter>,
    );

    act(() => {
      vi.advanceTimersByTime(6999);
    });
    expect(screen.getByText('Numero asignado')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByText('pantalla bienvenida')).toBeInTheDocument();
    expect(useTotemStore.getState().confirmacion).toBeNull();
    expect(useTotemStore.getState().dni).toBeNull();
  });
});
