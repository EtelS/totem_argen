using System.Collections.Generic;

namespace TotemApi.Models
{
    public class AtencionResponse
    {
        public const string TipoTurnos = "turnos";
        public const string TipoDerivado = "derivado";

        public string Tipo { get; set; }
        public PacienteAtencion Paciente { get; set; }
        public List<TurnoAtencion> Turnos { get; set; }
    }

    public class PacienteAtencion
    {
        public string Dni { get; set; }
        public string NombreYApellido { get; set; }
        public string Mutual { get; set; }
    }

    public class TurnoAtencion
    {
        public int Codigo { get; set; }
        // dd/MM/yyyy, same format the frontend uses.
        public string Fecha { get; set; }
        public string Hora { get; set; }
        public string Prestador { get; set; }
        public string Mutual { get; set; }
        // A particular turno cannot be confirmed at the totem: choosing it sends the patient to Recepcion.
        public bool Particular { get; set; }
    }
}
