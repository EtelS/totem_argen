import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API_BASE_URL } from '../config';
import { RegistrarPaciente } from './RegistrarPaciente';
import { useAuthStore } from '../store/useAuthStore';
import { useTotemStore } from '../store/useTotemStore';
import { mockFetch, respuestaJson } from '../tests/fetchMock';

function renderRegistrarPaciente() {
  render(
    <MemoryRouter initialEntries={['/registrar-paciente']}>
      <Routes>
        <Route path="/" element={<p>pantalla bienvenida</p>} />
        <Route path="/registrar-paciente" element={<RegistrarPaciente />} />
        <Route path="/confirmacion" element={<p>pantalla confirmacion</p>} />
        <Route path="/error" element={<p>pantalla error</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

function escribir(texto: string) {
  texto.split('').forEach((caracter) => {
    const nombre = caracter === ' ' ? 'Espacio' : `Letra o digito ${caracter}`;
    fireEvent.click(screen.getByRole('button', { name: nombre }));
  });
}

describe('RegistrarPaciente', () => {
  beforeEach(() => {
    useAuthStore.setState({
      usuario: 'eteltotem',
      token: 'jwt-123',
      sucursal: { suc_id: 16, suc_nom: 'clinicademo' },
      totemRecepcion: { tot_id: 3, tot_nom: 'Totem entrada' },
    });
    useTotemStore.setState({ dni: '11111111', seleccionTurno: null, pendienteToken: null, confirmacion: null });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('muestra el DNI ingresado y pide el nombre y apellido', () => {
    renderRegistrarPaciente();

    expect(screen.getByText('Ingresa tu nombre y apellido')).toBeInTheDocument();
    expect(screen.getByText('DNI 11111111')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Espacio' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument();
  });

  it('crea el paciente, registra el llamado con su codigo y deriva a Recepcion con su nombre', async () => {
    const fetchMock = mockFetch(
      respuestaJson(200, { PacienteCodigo: 12843800 }),
      respuestaJson(200, { Numero: 7 }),
    );
    renderRegistrarPaciente();

    escribir('juan perez');
    expect(screen.getByText('JUAN PEREZ')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByText('pantalla confirmacion')).toBeInTheDocument();
    const [urlPaciente, initPaciente] = fetchMock.mock.calls[0];
    expect(urlPaciente).toBe(`${API_BASE_URL}/api/atencion/paciente`);
    expect(JSON.parse(initPaciente.body)).toEqual({ Sucursal: 16, Dni: '11111111', Nombre: 'JUAN PEREZ' });
    const [urlLlamado, initLlamado] = fetchMock.mock.calls[1];
    expect(urlLlamado).toBe(`${API_BASE_URL}/api/atencion/llamado`);
    expect(JSON.parse(initLlamado.body)).toEqual({
      Sucursal: 16,
      Dni: '11111111',
      PacienteCodigo: 12843800,
      TotemRecepcionId: 3,
    });
    expect(useTotemStore.getState().confirmacion).toEqual({
      tipo: 'derivado',
      numero: 7,
      paciente: { codigo: 12843800, dni: '11111111', nombreYApellido: 'JUAN PEREZ', mutual: '' },
    });
  });

  it('no llama al backend y avisa cuando el nombre esta vacio o es muy corto', () => {
    const fetchMock = mockFetch();
    renderRegistrarPaciente();

    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.getByText('Ingresa tu nombre y apellido (al menos 3 letras)')).toBeInTheDocument();

    escribir('  j ');
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.getByText('Ingresa tu nombre y apellido (al menos 3 letras)')).toBeInTheDocument();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(useTotemStore.getState().confirmacion).toBeNull();
  });

  it('muestra la pantalla de error sin registrar el llamado cuando no se pudo crear el paciente', async () => {
    const fetchMock = mockFetch(respuestaJson(500, { Message: 'error' }));
    renderRegistrarPaciente();

    escribir('juan perez');
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByText('pantalla error')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(useTotemStore.getState().confirmacion).toBeNull();
  });

  it('muestra la pantalla de error cuando se creo el paciente pero no se pudo registrar el llamado', async () => {
    mockFetch(respuestaJson(200, { PacienteCodigo: 12843800 }), respuestaJson(500, { Message: 'error' }));
    renderRegistrarPaciente();

    escribir('juan perez');
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByText('pantalla error')).toBeInTheDocument();
    expect(useTotemStore.getState().confirmacion).toBeNull();
  });

  it('vuelve al inicio sin crear el paciente con el boton Volver', () => {
    const fetchMock = mockFetch();
    renderRegistrarPaciente();

    escribir('juan');
    fireEvent.click(screen.getByRole('button', { name: 'Volver' }));

    expect(screen.getByText('pantalla bienvenida')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(useTotemStore.getState().dni).toBeNull();
  });

  it('vuelve al inicio cuando no hay un DNI ingresado', () => {
    useTotemStore.setState({ dni: null });
    renderRegistrarPaciente();

    expect(screen.getByText('pantalla bienvenida')).toBeInTheDocument();
  });
});
