using System;
using System.Configuration;
using System.Net;
using System.Web.Http;
using TotemApi.Data;
using TotemApi.Helpers;
using TotemApi.Models;
using TotemApi.Services;

namespace TotemApi.Controllers
{
    public class AuthController : ApiController
    {
        [HttpPost]
        [Route("api/auth/login")]
        public IHttpActionResult Login([FromBody] LoginRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrEmpty(request.NombreUsuario) || string.IsNullOrEmpty(request.Contrasena))
                    return BadRequest("NombreUsuario y Contrasena son requeridos");

                var usuario = SqlServices.AutenticarUsuario(request.NombreUsuario, request.Contrasena);
                if (usuario == null)
                    return Unauthorized();

                var sucursales = SqlServices.TraerSucursales(usuario.Cliente);
                if (sucursales.Count == 0)
                    return Content(HttpStatusCode.Forbidden, new { mensaje = "El usuario no tiene sucursales asociadas" });

                return Ok(new LoginResponse
                {
                    Token = GenerarToken(usuario),
                    Usuario = usuario,
                    Sucursales = sucursales
                });
            }
            catch (Exception ex)
            {
                LogService.Error("Error en login", ex, "AuthController");
                return InternalServerError(ex);
            }
        }

        [HttpPost]
        [Route("api/auth/refresh")]
        public IHttpActionResult Refresh()
        {
            try
            {
                int codigo;
                int cliente;
                if (!int.TryParse(Request.Properties["UsuarioCodigo"] as string, out codigo)
                    || !int.TryParse(Request.Properties["Cliente"] as string, out cliente))
                    return Unauthorized();

                var usuario = SqlServices.TraerUsuarioPorCodigo(codigo, cliente);
                if (usuario == null)
                    return Unauthorized();

                return Ok(new { Token = GenerarToken(usuario) });
            }
            catch (Exception ex)
            {
                LogService.Error("Error en refresh", ex, "AuthController");
                return InternalServerError(ex);
            }
        }

        private static string GenerarToken(Usuario usuario)
        {
            var secret = ConfigurationManager.AppSettings["JwtSecret"];
            var expirationMinutes = int.Parse(ConfigurationManager.AppSettings["JwtExpirationMinutes"] ?? "43200");
            return JwtHelper.GenerateToken(usuario, secret, expirationMinutes);
        }
    }
}
