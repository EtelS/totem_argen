using System.Data.SqlClient;
using TotemApi.Helpers;

namespace TotemApi.Data
{
    public static class DbConnection
    {
        public static SqlConnection GetConnection()
        {
            return new SqlConnection(Conexion.ObtenerRutaConexion());
        }
    }
}
