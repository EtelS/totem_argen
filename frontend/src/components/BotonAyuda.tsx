import { useNavigate } from 'react-router-dom';

export function BotonAyuda() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/ayuda')}
      className="fixed bottom-6 right-6 rounded-full bg-totem-danger px-8 py-5 text-totem-lg font-bold text-white shadow-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-totem-navy"
      aria-label="Necesito ayuda"
    >
      Necesito ayuda
    </button>
  );
}
