import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Login } from './Login';
import { useAuthStore } from '../store/useAuthStore';
import { mockFetch, respuestaJson } from '../tests/fetchMock';

function escribir(texto: string) {
  texto.split('').forEach((caracter) => {
    fireEvent.click(screen.getByRole('button', { name: `Letra o digito ${caracter}` }));
  });
}

function ingresarCredenciales(usuario: string, contrasena: string) {
  escribir(usuario);
  fireEvent.click(screen.getByRole('button', { name: 'Campo contrasena' }));
  escribir(contrasena);
  fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
}

function renderLogin() {
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );
}

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ usuario: null, token: null, sucursal: null, sucursalesDisponibles: null });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('muestra el titulo, los campos y el teclado alfanumerico', () => {
    renderLogin();

    expect(screen.getByText('Iniciar sesion')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Campo usuario' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Campo contrasena' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeInTheDocument();
  });

  it('muestra error con credenciales invalidas', async () => {
    mockFetch(new Response(null, { status: 401 }));
    renderLogin();

    ingresarCredenciales('eteltotem', 'incorrecta');

    expect(await screen.findByText('Usuario o contrasena incorrectos')).toBeInTheDocument();
    expect(useAuthStore.getState().sucursal).toBeNull();
  });

  it('inicia sesion, guarda el token y autoselecciona la unica sucursal del usuario', async () => {
    const fetchMock = mockFetch(
      respuestaJson(200, {
        Token: 'jwt-123',
        Usuario: { NombreUsuario: 'eteltotem' },
        Sucursales: [{ Codigo: 16, Nombre: 'clinicademo' }],
      }),
    );
    renderLogin();

    ingresarCredenciales('eteltotem', 'eteltotem1234');

    await waitFor(() => {
      expect(useAuthStore.getState().sucursal).toEqual({ suc_id: 16, suc_nom: 'clinicademo' });
    });
    expect(useAuthStore.getState().token).toBe('jwt-123');
    expect(useAuthStore.getState().sucursalesDisponibles).toBeNull();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      NombreUsuario: 'eteltotem',
      Contrasena: 'eteltotem1234',
    });
  });

  it('pide elegir sucursal cuando el usuario tiene mas de una', async () => {
    mockFetch(
      respuestaJson(200, {
        Token: 'jwt-123',
        Usuario: { NombreUsuario: 'eteltotem' },
        Sucursales: [
          { Codigo: 16, Nombre: 'clinicademo' },
          { Codigo: 17, Nombre: 'clinicademo norte' },
        ],
      }),
    );
    renderLogin();

    ingresarCredenciales('eteltotem', 'eteltotem1234');

    await waitFor(() => {
      expect(useAuthStore.getState().sucursalesDisponibles).toHaveLength(2);
    });
    expect(useAuthStore.getState().sucursal).toBeNull();
  });

  it('muestra un error de conexion cuando el backend no responde', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    renderLogin();

    ingresarCredenciales('eteltotem', 'eteltotem1234');

    expect(await screen.findByText('No pudimos conectar con el sistema. Intenta nuevamente.')).toBeInTheDocument();
  });
});
