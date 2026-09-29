import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BotonAyuda } from '../components/BotonAyuda';
import { useElegirTurno } from '../hooks/useElegirTurno';
import { useTotemStore } from '../store/useTotemStore';

/**
 * Pantalla de seleccion de turno (`/seleccionar-turno`). Solo se muestra
 * cuando el paciente tiene mas de un turno hoy en la sucursal del totem.
 */
export function SeleccionarTurno() {
  const seleccionTurno = useTotemStore((s) => s.seleccionTurno);
  const elegirTurno = useElegirTurno();
  const navigate = useNavigate();
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!seleccionTurno) {
      navigate('/', { replace: true });
    }
  }, [seleccionTurno, navigate]);

  if (!seleccionTurno) {
    return null;
  }

  const { paciente, turnos } = seleccionTurno;

  async function elegir(turno: (typeof turnos)[number]) {
    setEnviando(true);
    await elegirTurno(paciente, turno);
    setEnviando(false);
  }

  return (
    <div className="flex w-full flex-col items-center gap-6 text-center">
      <h1 className="text-totem-xl font-bold">Elegi el turno a confirmar</h1>
      <p className="text-totem-lg">{paciente.nombreYApellido}</p>

      <div className="flex w-full flex-col gap-4">
        {turnos.map((turno) => (
          <button
            key={turno.codigo}
            type="button"
            onClick={() => elegir(turno)}
            disabled={enviando}
            className="flex w-full flex-col items-center gap-1 rounded-3xl bg-totem-success px-8 py-6 text-white shadow-md disabled:opacity-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-totem-navy"
          >
            <span className="text-totem-lg font-bold">
              {turno.hora} - {turno.prestador}
            </span>
            <span className="text-xl capitalize">{turno.particular ? 'Particular' : turno.mutual}</span>
          </button>
        ))}
      </div>

      <BotonAyuda />
    </div>
  );
}
