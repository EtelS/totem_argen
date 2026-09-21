import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { SeleccionarSucursal } from './SeleccionarSucursal';
import { useAuthStore } from '../store/useAuthStore';

describe('SeleccionarSucursal', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ usuario: 'eteltotem', sucursal: null, sucursalesDisponibles: null });
  });

  it('lista las sucursales disponibles y permite elegir una', () => {
    useAuthStore.setState({
      sucursalesDisponibles: [
        { suc_id: 16, suc_nom: 'clinicademo' },
        { suc_id: 17, suc_nom: 'clinicademo norte' },
      ],
    });

    render(
      <MemoryRouter>
        <SeleccionarSucursal />
      </MemoryRouter>,
    );

    expect(screen.getByText('Elegi la sucursal')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'clinicademo norte' }));

    expect(useAuthStore.getState().sucursal).toEqual({ suc_id: 17, suc_nom: 'clinicademo norte' });
    expect(useAuthStore.getState().sucursalesDisponibles).toBeNull();
  });
});
