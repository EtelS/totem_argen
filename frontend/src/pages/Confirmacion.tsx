import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTotemStore } from '../store/useTotemStore';
import { BotonAyuda } from '../components/BotonAyuda';

export function Confirmacion() {
  const confirmacion = useTotemStore((s) => s.confirmacion);
  const reset = useTotemStore((s) => s.reset);
  const navigate = useNavigate();

  useEffect(() => {
    if (!confirmacion) {
      navigate('/');
    }
  }, [confirmacion, navigate]);

  if (!confirmacion) {
    return null;
  }

  function imprimir() {
    // Mock simple de impresora termica en el frontend (ver README - supuestos).
    window.print();
  }

  function finalizar() {
    reset();
    navigate('/');
  }

  return (
    <div className="flex w-full flex-col items-center gap-6 text-center">
      {confirmacion.tipo === 'turno' ? (
        <>
          <h1 className="text-totem-xl font-bold text-totem-success">Turno confirmado</h1>
          <div className="w-full rounded-3xl border border-totem-border bg-totem-panel px-8 py-8 shadow-sm">
            <p className="text-totem-lg">{confirmacion.paciente.nombreYApellido}</p>
            <p className="mt-4 text-2xl">Prestador: {confirmacion.turno.prestador}</p>
            <p className="text-2xl">Fecha: {confirmacion.turno.fecha}</p>
            <p className="text-2xl">Hora: {confirmacion.turno.hora}</p>
            <p className="mt-4 text-2xl capitalize">Mutual: {confirmacion.turno.mutual}</p>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-totem-xl font-bold text-totem-success">Numero asignado</h1>
          <div className="w-full rounded-3xl border border-totem-border bg-totem-panel px-8 py-8 shadow-sm">
            {confirmacion.paciente && (
              <p className="text-totem-lg">{confirmacion.paciente.nombreYApellido}</p>
            )}
            <p className="mt-2 text-2xl">Tu numero es</p>
            <p className="text-totem-xl font-extrabold text-totem-success">{confirmacion.numero}</p>
            <p className="mt-4 text-lg opacity-80">
              Vas a ser atendido/a en Recepcion. Aguarda en la sala de espera, te llamaremos con ese
              numero.
            </p>
          </div>

          <button
            type="button"
            onClick={imprimir}
            className="w-full rounded-full bg-totem-accent py-6 text-totem-lg font-bold text-white shadow-md focus-visible:outline focus-visible:outline-4 focus-visible:outline-totem-navy"
          >
            Imprimir ticket
          </button>
        </>
      )}

      <button
        type="button"
        onClick={finalizar}
        className="w-full rounded-full border-2 border-totem-navy py-4 text-xl font-semibold text-totem-navy"
      >
        Finalizar
      </button>

      <BotonAyuda />
    </div>
  );
}
