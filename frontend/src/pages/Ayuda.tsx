import { useNavigate } from 'react-router-dom';

export function Ayuda() {
  const navigate = useNavigate();

  return (
    <div className="flex w-full flex-col items-center gap-8 text-center">
      <h1 className="text-totem-xl font-bold">Vamos a ayudarte</h1>
      <p className="text-totem-lg">Se notifico a Recepcion. Por favor esperá, ya te vamos a atender.</p>

      <button
        type="button"
        onClick={() => navigate('/')}
        className="w-full rounded-full bg-totem-accent py-6 text-totem-lg font-bold text-white shadow-md focus-visible:outline focus-visible:outline-4 focus-visible:outline-totem-navy"
      >
        Volver al inicio
      </button>
    </div>
  );
}
