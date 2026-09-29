using System;
using System.Collections.Generic;

namespace TotemApi.Models
{
    // Result sets returned by spTotemAtencionPorDniSel.
    public class AtencionPorDni
    {
        public PacienteFila Paciente { get; set; }
        public List<TurnoFila> Turnos { get; set; }
    }

    public class PacienteFila
    {
        public string Dni { get; set; }
        public string NombreYApellido { get; set; }
        public string MutualPaciente { get; set; }
    }

    public class TurnoFila
    {
        public int Codigo { get; set; }
        public DateTime Fecha { get; set; }
        public string Hora { get; set; }
        public string Prestador { get; set; }
        public string Mutual { get; set; }
    }
}
