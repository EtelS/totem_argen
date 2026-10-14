import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SeleccionarTotem } from './SeleccionarTotem';
import { useAuthStore } from '../store/useAuthStore';
import { mockFetch, respuestaJson } from '../tests/fetchMock';

function renderSeleccionarTotem() {
  render(
    <MemoryRouter initialEntries={['/seleccionar-totem']}>
      <Routes>
        <Route path="/seleccionar-totem" element={<SeleccionarTotem />} />
        <Route path="/" element={<p>pantalla inicio</p>} />
        <Route path="/login" element={<p>pantalla login</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('SeleccionarTotem', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      usuario: 'eteltotem',
      token: 'jwt-123',
      sucursal: { suc_id: 16, suc_nom: 'clinicademo' },
      totemRecepcion: null,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lista los totems de la sucursal y guarda el elegido', async () => {
    mockFetch(
      respuestaJson(200, [
        { Codigo: 3, Nombre: 'Totem entrada' },
        { Codigo: 4, Nombre: 'Totem guardia' },
      ]),
    );
    renderSeleccionarTotem();

    expect(await screen.findByText('Elegi el totem')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Totem guardia' }));

    expect(useAuthStore.getState().totemRecepcion).toEqual({ tot_id: 4, tot_nom: 'Totem guardia' });
    expect(await screen.findByText('pantalla inicio')).toBeInTheDocument();
  });

  it('autoselecciona el totem cuando la sucursal tiene uno solo', async () => {
    mockFetch(respuestaJson(200, [{ Codigo: 3, Nombre: 'Totem entrada' }]));
    renderSeleccionarTotem();

    await waitFor(() => {
      expect(useAuthStore.getState().totemRecepcion).toEqual({ tot_id: 3, tot_nom: 'Totem entrada' });
    });
    expect(await screen.findByText('pantalla inicio')).toBeInTheDocument();
  });

  it('avisa cuando la sucursal no tiene totems de recepcion', async () => {
    mockFetch(respuestaJson(200, []));
    renderSeleccionarTotem();

    expect(await screen.findByText('La sucursal no tiene totems de recepcion')).toBeInTheDocument();
    expect(useAuthStore.getState().totemRecepcion).toBeNull();
  });

  it('muestra un error si no se pueden traer los totems', async () => {
    mockFetch(respuestaJson(500, { Message: 'Error' }));
    renderSeleccionarTotem();

    expect(await screen.findByText('No pudimos traer los totems. Intenta nuevamente.')).toBeInTheDocument();
  });

  it('vuelve al login si no hay sesion', async () => {
    useAuthStore.setState({ token: null, sucursal: null });
    renderSeleccionarTotem();

    expect(await screen.findByText('pantalla login')).toBeInTheDocument();
  });
});
