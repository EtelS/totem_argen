namespace TotemApi.Models
{
    public class InsertarPacienteRequest
    {
        public int Sucursal { get; set; }
        public string Dni { get; set; }
        // Nombre y apellido as entered in the totem.
        public string Nombre { get; set; }
    }
}
