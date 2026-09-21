import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { Token } from './Token';
import { useTotemStore } from '../store/useTotemStore';

const PACIENTE = { dni: '30738807', nombreYApellido: 'Etel Perez', mutual: 'swiss medical', token: '123' };
const TURNO = { fecha: '17/09/2026', hora: '15:00', prestador: 'Romo Guillermo', pacienteDni: '30738807' };

function ingresarDigitos(digitos: string) {
  digitos.split('').forEach((digito) => {
    fireEvent.click(screen.getByRole('button', { name: `Digito ${digito}` }));
  });
}

describe('Token', () => {
  beforeEach(() => {
    useTotemStore.setState({
      dni: '30738807',
      pendienteToken: { paciente: PACIENTE, turno: TURNO },
      confirmacion: null,
      contador: 0,
    });
  });

  it('confirma el turno cuando el token coincide', () => {
    render(
      <MemoryRouter>
        <Token />
      </MemoryRouter>,
    );

    ingresarDigitos('123');
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(useTotemStore.getState().confirmacion).toEqual({ tipo: 'turno', paciente: PACIENTE, turno: TURNO });
    expect(useTotemStore.getState().pendienteToken).toBeNull();
  });

  it('da una segunda oportunidad cuando el token no coincide la primera vez', () => {
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

    expect(useTotemStore.getState().confirmacion).toEqual({ tipo: 'turno', paciente: PACIENTE, turno: TURNO });
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
