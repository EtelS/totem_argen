import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API_BASE_URL } from '../config';
import { Bienvenida } from './Bienvenida';
import { useAuthStore } from '../store/useAuthStore';
import { useTotemStore } from '../store/useTotemStore';
import { mockFetch, respuestaJson } from '../tests/fetchMock';

const PACIENTE_DTO = { Codigo: 501, Dni: '30738807', NombreYApellido: 'Etel Perez', Mutual: 'SWISS MEDICAL' };
const TURNO_MUTUAL_DTO = {
  Codigo: 11,
  Fecha: '29/09/2026',
  Hora: '15:00',
  Prestador: 'Romo Guillermo',
  Mutual: 'SWISS MEDICAL',
  Autogestion: true, PideCodigoSeguridad: false,
};
const TURNO_PARTICULAR_DTO = {
  Codigo: 10,
  Fecha: '29/09/2026',
  Hora: '10:00',
  Prestador: 'Diaz Carla',
  Mutual: 'particular',
  Autogestion: false, PideCodigoSeguridad: false,
};

function renderBienvenida() {
  render(
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Bienvenida />} />
        <Route path="/seleccionar-turno" element={<p>pantalla seleccionar turno</p>} />
        <Route path="/confirmacion" element={<p>pantalla confirmacion</p>} />
        <Route path="/token" element={<p>pantalla token</p>} />
        <Route path="/error" element={<p>pantalla error</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

function ingresarDni(dni: string) {
  dni.split('').forEach((digito) => {
    fireEvent.click(screen.getByRole('button', { name: `Digito ${digito}` }));
  });
  fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
}

describe('Bienvenida', () => {
  beforeEach(() => {
    useAuthStore.setState({ usuario: 'eteltotem', token: 'jwt-123', sucursal: { suc_id: 16, suc_nom: 'clinicademo' } });
    useTotemStore.setState({ dni: null, seleccionTurno: null, pendienteToken: null, confirmacion: null });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('muestra el titulo y el teclado numerico', () => {
    renderBienvenida();

    expect(screen.getByText('Bienvenido/a')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu numero de DNI')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Necesito ayuda' })).toBeInTheDocument();
  });

  it('confirma directo en el backend cuando el paciente tiene un solo turno hoy con mutual', async () => {
    const fetchMock = mockFetch(
      respuestaJson(200, { Tipo: 'turnos', Paciente: PACIENTE_DTO, Turnos: [TURNO_MUTUAL_DTO] }),
      respuestaJson(200, { Numero: 7 }),
      respuestaJson(200, { Mensaje: 'Turno confirmado' }),
    );
    renderBienvenida();

    ingresarDni('30738807');

    expect(await screen.findByText('pantalla confirmacion')).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_BASE_URL}/api/atencion?sucursal=16&dni=30738807`);
    const [urlLlamado, initLlamado] = fetchMock.mock.calls[1];
    expect(urlLlamado).toBe(`${API_BASE_URL}/api/atencion/llamado`);
    expect(JSON.parse(initLlamado.body)).toEqual({ Sucursal: 16, Dni: '30738807', PacienteCodigo: 501 });
    const [urlConfirmar, initConfirmar] = fetchMock.mock.calls[2];
    expect(urlConfirmar).toBe(`${API_BASE_URL}/api/atencion/confirmar`);
    expect(JSON.parse(initConfirmar.body)).toEqual({ Sucursal: 16, Dni: '30738807', TurnoCodigo: 11 });
    expect(useTotemStore.getState().confirmacion).toMatchObject({
      tipo: 'turno',
      numero: 7,
      turno: { prestador: 'Romo Guillermo', hora: '15:00' },
    });
  });

  it('no muestra el turno como confirmado si el backend no pudo registrarlo', async () => {
    mockFetch(
      respuestaJson(200, { Tipo: 'turnos', Paciente: PACIENTE_DTO, Turnos: [TURNO_MUTUAL_DTO] }),
      respuestaJson(200, { Numero: 7 }),
      respuestaJson(404, { Message: 'Not Found' }),
    );
    renderBienvenida();

    ingresarDni('30738807');

    expect(await screen.findByText('pantalla error')).toBeInTheDocument();
    expect(useTotemStore.getState().confirmacion).toBeNull();
  });

  it('deriva a Recepcion con el numero del llamado, sin confirmar, cuando la mutual del unico turno de hoy no tiene autogestion', async () => {
    const fetchMock = mockFetch(
      respuestaJson(200, { Tipo: 'turnos', Paciente: PACIENTE_DTO, Turnos: [TURNO_PARTICULAR_DTO] }),
      respuestaJson(200, { Numero: 7 }),
    );
    renderBienvenida();

    ingresarDni('30738807');

    expect(await screen.findByText('pantalla confirmacion')).toBeInTheDocument();
    expect(useTotemStore.getState().confirmacion).toMatchObject({ tipo: 'derivado', numero: 7 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe(`${API_BASE_URL}/api/atencion/llamado`);
  });

  it('muestra la pantalla de error sin derivar cuando no se pudo registrar el llamado', async () => {
    mockFetch(
      respuestaJson(200, { Tipo: 'turnos', Paciente: PACIENTE_DTO, Turnos: [TURNO_PARTICULAR_DTO] }),
      respuestaJson(404, { Message: 'Not Found' }),
    );
    renderBienvenida();

    ingresarDni('30738807');

    expect(await screen.findByText('pantalla error')).toBeInTheDocument();
    expect(useTotemStore.getState().confirmacion).toBeNull();
  });

  it('pide el token sin confirmar en el backend cuando la mutual pide codigo de seguridad', async () => {
    const fetchMock = mockFetch(
      respuestaJson(200, {
        Tipo: 'turnos',
        Paciente: PACIENTE_DTO,
        Turnos: [{ ...TURNO_MUTUAL_DTO, PideCodigoSeguridad: true }],
      }),
      respuestaJson(200, { Numero: 7 }),
    );
    renderBienvenida();

    ingresarDni('30738807');

    expect(await screen.findByText('pantalla token')).toBeInTheDocument();
    expect(useTotemStore.getState().pendienteToken?.turno).toMatchObject({ codigo: 11, pideCodigoSeguridad: true });
    expect(useTotemStore.getState().pendienteToken?.numero).toBe(7);
    expect(useTotemStore.getState().confirmacion).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('pide elegir el turno cuando el paciente tiene varios hoy', async () => {
    mockFetch(
      respuestaJson(200, { Tipo: 'turnos', Paciente: PACIENTE_DTO, Turnos: [TURNO_PARTICULAR_DTO, TURNO_MUTUAL_DTO] }),
    );
    renderBienvenida();

    ingresarDni('30738807');

    expect(await screen.findByText('pantalla seleccionar turno')).toBeInTheDocument();
    expect(useTotemStore.getState().seleccionTurno?.turnos).toHaveLength(2);
    expect(useTotemStore.getState().confirmacion).toBeNull();
  });

  it('registra el llamado sin paciente y deriva con su numero cuando el DNI no existe', async () => {
    const fetchMock = mockFetch(
      respuestaJson(200, { Tipo: 'derivado', Paciente: null, Turnos: null }),
      respuestaJson(200, { Numero: 7 }),
    );
    renderBienvenida();

    ingresarDni('11111111');

    expect(await screen.findByText('pantalla confirmacion')).toBeInTheDocument();
    const [urlLlamado, initLlamado] = fetchMock.mock.calls[1];
    expect(urlLlamado).toBe(`${API_BASE_URL}/api/atencion/llamado`);
    expect(JSON.parse(initLlamado.body)).toEqual({ Sucursal: 16, Dni: '11111111', PacienteCodigo: null });
    expect(useTotemStore.getState().confirmacion).toEqual({ tipo: 'derivado', numero: 7, paciente: undefined });
  });

  it('registra el llamado con el codigo del paciente cuando no tiene turnos hoy', async () => {
    const fetchMock = mockFetch(
      respuestaJson(200, { Tipo: 'derivado', Paciente: PACIENTE_DTO, Turnos: null }),
      respuestaJson(200, { Numero: 8 }),
    );
    renderBienvenida();

    ingresarDni('30738807');

    expect(await screen.findByText('pantalla confirmacion')).toBeInTheDocument();
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ Sucursal: 16, Dni: '30738807', PacienteCodigo: 501 });
    expect(useTotemStore.getState().confirmacion).toMatchObject({ tipo: 'derivado', numero: 8, paciente: { codigo: 501 } });
  });

  it('muestra la pantalla de error cuando no se pudo registrar el llamado de un DNI sin turnos', async () => {
    mockFetch(
      respuestaJson(200, { Tipo: 'derivado', Paciente: null, Turnos: null }),
      respuestaJson(500, { Message: 'error' }),
    );
    renderBienvenida();

    ingresarDni('11111111');

    expect(await screen.findByText('pantalla error')).toBeInTheDocument();
    expect(useTotemStore.getState().confirmacion).toBeNull();
  });

  it('muestra la pantalla de error cuando el backend falla', async () => {
    mockFetch(respuestaJson(500, { Message: 'error' }));
    renderBienvenida();

    ingresarDni('30738807');

    expect(await screen.findByText('pantalla error')).toBeInTheDocument();
    await waitFor(() => expect(useTotemStore.getState().confirmacion).toBeNull());
  });
});
