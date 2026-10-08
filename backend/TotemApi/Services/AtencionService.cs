using System.Linq;
using TotemApi.Models;

namespace TotemApi.Services
{
    public static class AtencionService
    {
        // Unknown DNIs and patients without turnos today are sent to Recepcion.
        // Otherwise the patient picks one of today's turnos at the totem.
        public static AtencionResponse Resolver(AtencionPorDni atencion)
        {
            if (atencion.Paciente == null)
                return new AtencionResponse { Tipo = AtencionResponse.TipoDerivado };

            var paciente = new PacienteAtencion
            {
                Codigo = atencion.Paciente.Codigo,
                Dni = atencion.Paciente.Dni,
                NombreYApellido = atencion.Paciente.NombreYApellido,
                Mutual = atencion.Paciente.MutualPaciente
            };

            if (atencion.Turnos.Count == 0)
                return new AtencionResponse { Tipo = AtencionResponse.TipoDerivado, Paciente = paciente };

            return new AtencionResponse
            {
                Tipo = AtencionResponse.TipoTurnos,
                Paciente = paciente,
                Turnos = atencion.Turnos.Select(t => new TurnoAtencion
                {
                    Codigo = t.Codigo,
                    Fecha = t.Fecha.ToString("dd/MM/yyyy"),
                    Hora = t.Hora,
                    Prestador = t.Prestador,
                    Mutual = t.Mutual,
                    // Configured per sucursal and mutual in BDTurnero..SucursalPorMutual.
                    Autogestion = t.TotemAutogestion,
                    PideCodigoSeguridad = t.TotemAutogestion && t.PideCodigoSeguridad
                }).ToList()
            };
        }
    }
}
