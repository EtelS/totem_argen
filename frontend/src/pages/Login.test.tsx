import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { Login } from './Login';
import { useAuthStore } from '../store/useAuthStore';

function escribir(texto: string) {
  texto.split('').forEach((caracter) => {
    fireEvent.click(screen.getByRole('button', { name: `Letra o digito ${caracter}` }));
  });
}

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ usuario: null, sucursal: null, sucursalesDisponibles: null });
  });

  it('muestra el titulo, los campos y el teclado alfanumerico', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    expect(screen.getByText('Iniciar sesion')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Campo usuario' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Campo contrasena' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeInTheDocument();
  });

  it('muestra error con credenciales invalidas', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    escribir('eteltotem');
    fireEvent.click(screen.getByRole('button', { name: 'Campo contrasena' }));
    escribir('incorrecta');
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(await screen.findByText('Usuario o contrasena incorrectos')).toBeInTheDocument();
    expect(useAuthStore.getState().sucursal).toBeNull();
  });

  it('inicia sesion y autoselecciona la unica sucursal del usuario', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    escribir('eteltotem');
    fireEvent.click(screen.getByRole('button', { name: 'Campo contrasena' }));
    escribir('eteltotem1234');
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() => {
      expect(useAuthStore.getState().sucursal).toEqual({ suc_id: 16, suc_nom: 'clinicademo' });
    });
    expect(useAuthStore.getState().sucursalesDisponibles).toBeNull();
  });
});
