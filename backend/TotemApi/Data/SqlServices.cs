using System.Collections.Generic;
using System.Data;
using System.Linq;
using Dapper;
using TotemApi.Models;

namespace TotemApi.Data
{
    public static class SqlServices
    {
        // ==================== AUTH ====================

        public static Usuario AutenticarUsuario(string nombreUsuario, string contrasena)
        {
            using (var conn = DbConnection.GetConnection())
            {
                return conn.QueryFirstOrDefault<Usuario>(
                    "spTotemAuthUsuarioSel",
                    new { NombreUsuario = nombreUsuario, Contrasena = contrasena },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: 60
                );
            }
        }

        public static Usuario TraerUsuarioPorCodigo(int codigo, int cliente)
        {
            using (var conn = DbConnection.GetConnection())
            {
                return conn.QueryFirstOrDefault<Usuario>(
                    "spTotemUsuarioPorCodigoSel",
                    new { Codigo = codigo, Cliente = cliente },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: 60
                );
            }
        }

        // ==================== SUCURSALES ====================

        public static List<Sucursal> TraerSucursales(int cliente)
        {
            using (var conn = DbConnection.GetConnection())
            {
                return conn.Query<Sucursal>(
                    "spTotemSucursalesSel",
                    new { Cliente = cliente },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: 60
                ).ToList();
            }
        }

        // ==================== ATENCION ====================

        public static AtencionPorDni TraerAtencionPorDni(int cliente, int sucursalId, string dni)
        {
            using (var conn = DbConnection.GetConnection())
            using (var resultados = conn.QueryMultiple(
                "spTotemAtencionPorDniSel",
                new { Cliente = cliente, SucursalId = sucursalId, Dni = dni },
                commandType: CommandType.StoredProcedure,
                commandTimeout: 60))
            {
                return new AtencionPorDni
                {
                    Paciente = resultados.ReadFirstOrDefault<PacienteFila>(),
                    Turnos = resultados.Read<TurnoFila>().ToList()
                };
            }
        }

        public static bool ConfirmarTurno(int cliente, int sucursalId, string dni, int turnoId)
        {
            using (var conn = DbConnection.GetConnection())
            {
                var filas = conn.ExecuteScalar<int>(
                    "spTotemTurnoConfirmarUpd",
                    new { Cliente = cliente, SucursalId = sucursalId, Dni = dni, TurnoId = turnoId },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: 60
                );
                return filas > 0;
            }
        }
    }
}
