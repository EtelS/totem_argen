using System.Configuration;

namespace TotemApi.Helpers
{
    public static class Conexion
    {
        private static readonly string rutaConexion = ConfigurationManager.AppSettings["RutaConexion"];

        public static string ObtenerRutaConexion()
        {
            return rutaConexion;
        }
    }
}
