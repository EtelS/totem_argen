import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TecladoNumerico } from '../components/TecladoNumerico';
import { BotonAyuda } from '../components/BotonAyuda';
import { useTotemStore } from '../store/useTotemStore';
import { buscarAtencion } from '../mock/buscarAtencion';

/**
 * Pantalla de bienvenida (`/`). Busca al paciente por DNI en la data mock:
 * si tiene turno con mutual/obra social, confirma el turno; si es
 * particular o no se encuentra, se deriva a Recepcion con un numero de orden.
 */
export function Bienvenida() {
  const [dni, setDni] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const setDniStore = useTotemStore((s) => s.setDni);
  const setPendienteToken = useTotemStore((s) => s.setPendienteToken);
  const setConfirmacion = useTotemStore((s) => s.setConfirmacion);
  const siguienteNumero = useTotemStore((s) => s.siguienteNumero);

  function continuar() {
    if (dni.length < 7) {
      setError('Ingresa un DNI valido (7 u 8 digitos)');
      return;
    }

    setError(null);
    setDniStore(dni);

    const resultado = buscarAtencion(dni);

    if (resultado.tipo === 'turno') {
      if (resultado.paciente.token) {
        setPendienteToken({ paciente: resultado.paciente, turno: resultado.turno });
        navigate('/token');
        return;
      }
      setConfirmacion({ tipo: 'turno', paciente: resultado.paciente, turno: resultado.turno });
    } else {
      setConfirmacion({ tipo: 'derivado', numero: siguienteNumero(), paciente: resultado.paciente });
    }

    navigate('/confirmacion');
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
        className="w-full rounded-full bg-totem-success py-6 text-totem-lg font-bold text-white shadow-md disabled:opacity-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-totem-navy"
      >
        Continuar
      </button>

      <BotonAyuda />
    </div>
  );
}
