import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TecladoAlfanumerico } from '../components/TecladoAlfanumerico';
import { BotonAyuda } from '../components/BotonAyuda';
import { useTotemStore } from '../store/useTotemStore';
import { useAuthStore } from '../store/useAuthStore';
import { ApiError } from '../api/client';
import { insertarPaciente } from '../api/atencion';
import { useRegistrarLlamado } from '../hooks/useRegistrarLlamado';

const NOMBRE_MAX = 60;
const NOMBRE_MIN = 3;

/** Uppercase, single spaces and no surrounding blanks, as names are stored. */
function normalizarNombre(nombre: string) {
  return nombre.trim().replace(/\s+/g, ' ').toUpperCase();
}

/**
 * Pantalla de alta de paciente (`/registrar-paciente`) para un DNI que no
 * existe en la base. Crea el paciente con el nombre ingresado, registra el
 * llamado con su codigo y lo deriva a Recepcion con ese numero.
 */
export function RegistrarPaciente() {
  const dni = useTotemStore((s) => s.dni);
  const setConfirmacion = useTotemStore((s) => s.setConfirmacion);
  const reset = useTotemStore((s) => s.reset);
  const sucursal = useAuthStore((s) => s.sucursal);
  const navigate = useNavigate();
  const registrarLlamado = useRegistrarLlamado();

  const [nombre, setNombre] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!dni) {
      navigate('/');
    }
  }, [dni, navigate]);

  if (!dni) {
    return null;
  }

  async function continuar() {
    if (!dni || !sucursal) {
      return;
    }

    const nombreFinal = normalizarNombre(nombre);
    if (nombreFinal.length < NOMBRE_MIN) {
      setError(`Ingresa tu nombre y apellido (al menos ${NOMBRE_MIN} letras)`);
      return;
    }

    setError(null);
    setEnviando(true);

    let codigo: number;
    try {
      codigo = await insertarPaciente(sucursal.suc_id, dni, nombreFinal);
    } catch (e) {
      setEnviando(false);
      // A 401 already closed the session; RequireSesion sends the totem back to login.
      if (!(e instanceof ApiError && e.status === 401)) {
        navigate('/error');
      }
      return;
    }

    const numero = await registrarLlamado(dni, codigo);
    setEnviando(false);
    if (numero === null) {
      return;
    }

    setConfirmacion({
      tipo: 'derivado',
      numero,
      paciente: { codigo, dni, nombreYApellido: nombreFinal, mutual: '' },
    });
    navigate('/confirmacion');
  }

  function volver() {
    reset();
    navigate('/');
  }

  return (
    <div className="flex w-full flex-col items-center gap-8 text-center">
      <h1 className="text-totem-xl font-bold">Ingresa tu nombre y apellido</h1>
      <p className="text-totem-lg">DNI {dni}</p>

      <div
        className="w-full rounded-2xl border border-totem-border bg-totem-panel px-8 py-6 text-totem-lg shadow-sm"
        aria-live="polite"
      >
        {nombre.toUpperCase() || '________'}
      </div>

      {error && <p className="text-xl font-semibold text-totem-danger">{error}</p>}

      <TecladoAlfanumerico valor={nombre} onCambiar={setNombre} maxLength={NOMBRE_MAX} conEspacio />

      <button
        type="button"
        onClick={continuar}
        disabled={enviando}
        className="w-full rounded-full bg-totem-success py-6 text-totem-lg font-bold text-white shadow-md disabled:opacity-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-totem-navy"
      >
        Continuar
      </button>

      <button
        type="button"
        onClick={volver}
        disabled={enviando}
        className="w-full rounded-full border-2 border-totem-navy py-4 text-xl font-semibold text-totem-navy disabled:opacity-50"
      >
        Volver
      </button>

      <BotonAyuda />
    </div>
  );
}
