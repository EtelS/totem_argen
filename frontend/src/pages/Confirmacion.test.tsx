import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { Confirmacion } from './Confirmacion';
import { useTotemStore } from '../store/useTotemStore';

describe('Confirmacion', () => {
  beforeEach(() => {
    useTotemStore.setState({ dni: null, confirmacion: null, contador: 0 });
  });

  it('muestra los datos del turno cuando el paciente tiene mutual y turno', () => {
    useTotemStore.setState({
      dni: '30738807',
      confirmacion: {
        tipo: 'turno',
        paciente: { dni: '30738807', nombreYApellido: 'Etel Perez', mutual: 'swiss medical', token: '123' },
        turno: { codigo: 1, fecha: '17/09/2026', hora: '15:00', prestador: 'Romo Guillermo', mutual: 'swiss medical', particular: false },
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
    expect(screen.queryByText(/Token/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Imprimir ticket' })).not.toBeInTheDocument();
  });

  it('muestra el nombre y avisa que sera atendido en Recepcion cuando el paciente es conocido', () => {
    useTotemStore.setState({
      dni: '29712252',
      confirmacion: {
        tipo: 'derivado',
        numero: 1,
        paciente: { dni: '29712252', nombreYApellido: 'Mauro Herrera', mutual: 'particular', token: '' },
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
  });
});
