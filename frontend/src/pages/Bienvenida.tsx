import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TecladoNumerico } from '../components/TecladoNumerico';
import { BotonAyuda } from '../components/BotonAyuda';
import { useTotemStore } from '../store/useTotemStore';
import { useAuthStore } from '../store/useAuthStore';
import { ApiError } from '../api/client';
import { buscarAtencion, ResultadoAtencion } from '../api/atencion';
import { useElegirTurno } from '../hooks/useElegirTurno';
import { useRegistrarLlamado } from '../hooks/useRegistrarLlamado';

/**
 * Pantalla de bienvenida (`/`). Busca al paciente por DNI en el backend:
 * con varios turnos hoy el paciente elige cual confirmar
 * (`/seleccionar-turno`); con uno solo se resuelve directo. Sin turnos o sin
 * paciente, se registra el llamado y se deriva a Recepcion con su numero.
 */
export function Bienvenida() {
  const [dni, setDni] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const sucursal = useAuthStore((s) => s.sucursal);
  const setDniStore = useTotemStore((s) => s.setDni);
  const setSeleccionTurno = useTotemStore((s) => s.setSeleccionTurno);
  const setConfirmacion = useTotemStore((s) => s.setConfirmacion);
  const elegirTurno = useElegirTurno();
  const registrarLlamado = useRegistrarLlamado();

  async function continuar() {
    if (dni.length < 7) {
      setError('Ingresa un DNI valido (7 u 8 digitos)');
      return;
    }
    if (!sucursal) {
      return;
    }

    setError(null);
    setDniStore(dni);
    setCargando(true);

    let resultado: ResultadoAtencion;
    try {
      resultado = await buscarAtencion(sucursal.suc_id, dni);
    } catch (e) {
      setCargando(false);
      // A 401 already closed the session; RequireSesion sends the totem back to login.
      if (!(e instanceof ApiError && e.status === 401)) {
        navigate('/error');
      }
      return;
    }

    if (resultado.tipo === 'derivado') {
      const numero = await registrarLlamado(dni, resultado.paciente?.codigo ?? null);
      setCargando(false);
      if (numero === null) {
        return;
      }
      setConfirmacion({ tipo: 'derivado', numero, paciente: resultado.paciente });
      navigate('/confirmacion');
      return;
    }

    if (resultado.turnos.length === 1) {
      // Keeps the button disabled while the single turno is confirmed in the backend.
      await elegirTurno(resultado.paciente, resultado.turnos[0]);
      setCargando(false);
      return;
    }

    setSeleccionTurno({ paciente: resultado.paciente, turnos: resultado.turnos });
    navigate('/seleccionar-turno');
  }

  return (
    <div className="flex w-full flex-col items-center gap-8 text-center">
      <h1 className="text-totem-xl font-bold">Bienvenido/a</h1>
      <p className="text-totem-lg">Ingresa tu numero de DNI</p>

      <div
        className="w-full rounded-2xl border border-totem-border bg-totem-panel px-8 py-6 text-totem-xl tracking-widest shadow-sm"
        aria-live="polite"
      >
        {dni || '________'}
      </div>

      {error && <p className="text-xl font-semibold text-totem-danger">{error}</p>}

      <TecladoNumerico valor={dni} onCambiar={setDni} />

      <button
        type="button"
        onClick={continuar}
        disabled={cargando}
        className="w-full rounded-full bg-totem-success py-6 text-totem-lg font-bold text-white shadow-md disabled:opacity-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-totem-navy"
      >
        Continuar
      </button>

      <BotonAyuda />
    </div>
  );
}
