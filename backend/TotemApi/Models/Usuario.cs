namespace TotemApi.Models
{
    public class Usuario
    {
        public int Codigo { get; set; }
        public string NombreUsuario { get; set; }
        public string NombreCompleto { get; set; }
        public int Cliente { get; set; }
        public bool Habilitado { get; set; }
    }
}
