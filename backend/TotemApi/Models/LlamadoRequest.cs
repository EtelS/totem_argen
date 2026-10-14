namespace TotemApi.Models
{
    public class LlamadoRequest
    {
        public int Sucursal { get; set; }
        public string Dni { get; set; }
        // Null when the DNI does not match any paciente.
        public int? PacienteCodigo { get; set; }
        // BDTurnero..TotemRecepcion.Codigo of the totem that registers the llamado.
        public int? TotemRecepcionId { get; set; }
    }
}
