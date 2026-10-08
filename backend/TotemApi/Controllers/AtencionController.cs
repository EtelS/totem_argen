using System;
using System.Text.RegularExpressions;
using System.Web.Http;
using TotemApi.Data;
using TotemApi.Models;
using TotemApi.Services;

namespace TotemApi.Controllers
{
    [RoutePrefix("api/atencion")]
    public class AtencionController : ApiController
    {
        private static readonly Regex DniValido = new Regex(@"^\d{7,8}$");

        [HttpGet]
        [Route("")]
        public IHttpActionResult BuscarAtencion(int sucursal, string dni)
        {
            try
            {
                if (dni == null || !DniValido.IsMatch(dni))
                    return BadRequest("El DNI debe tener 7 u 8 dígitos");

                int cliente;
                if (!int.TryParse(Request.Properties["Cliente"] as string, out cliente))
                    return Unauthorized();

                var atencion = SqlServices.TraerAtencionPorDni(cliente, sucursal, dni);
                return Ok(AtencionService.Resolver(atencion));
            }
            catch (Exception ex)
            {
                LogService.Error("Error buscando atención", ex, "AtencionController");
                return InternalServerError(ex);
            }
        }

        [HttpPost]
        [Route("confirmar")]
        public IHttpActionResult ConfirmarTurno([FromBody] ConfirmarTurnoRequest request)
        {
            try
            {
                if (request == null || request.TurnoCodigo <= 0 || request.Dni == null || !DniValido.IsMatch(request.Dni))
                    return BadRequest("Sucursal, Dni y TurnoCodigo son requeridos");

                int cliente;
                if (!int.TryParse(Request.Properties["Cliente"] as string, out cliente))
                    return Unauthorized();

                if (!SqlServices.ConfirmarTurno(cliente, request.Sucursal, request.Dni, request.TurnoCodigo))
                    return NotFound();

                return Ok(new { Mensaje = "Turno confirmado" });
            }
            catch (Exception ex)
            {
                LogService.Error("Error confirmando turno " + (request != null ? request.TurnoCodigo : 0), ex, "AtencionController");
                return InternalServerError(ex);
            }
        }

        [HttpPost]
        [Route("llamado")]
        public IHttpActionResult InsertarLlamado([FromBody] LlamadoRequest request)
        {
            try
            {
                if (request == null || request.PacienteCodigo <= 0 || request.Dni == null || !DniValido.IsMatch(request.Dni))
                    return BadRequest("Sucursal y Dni son requeridos; PacienteCodigo debe ser positivo si se informa");

                int cliente;
                if (!int.TryParse(Request.Properties["Cliente"] as string, out cliente))
                    return Unauthorized();

                var numero = SqlServices.InsertarLlamado(cliente, request.Sucursal, request.Dni, request.PacienteCodigo);
                if (numero == null)
                    return NotFound();

                return Ok(new { Numero = numero.Value });
            }
            catch (Exception ex)
            {
                LogService.Error("Error insertando llamado del DNI " + (request != null ? request.Dni : ""), ex, "AtencionController");
                return InternalServerError(ex);
            }
        }
    }
}
