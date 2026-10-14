using System;
using System.Web.Http;
using TotemApi.Data;
using TotemApi.Services;

namespace TotemApi.Controllers
{
    [RoutePrefix("api/totems-recepcion")]
    public class TotemsRecepcionController : ApiController
    {
        [HttpGet]
        [Route("")]
        public IHttpActionResult TraerTotems(int sucursal)
        {
            try
            {
                if (sucursal <= 0)
                    return BadRequest("Sucursal es requerida");

                int cliente;
                if (!int.TryParse(Request.Properties["Cliente"] as string, out cliente))
                    return Unauthorized();

                return Ok(SqlServices.TraerTotemsRecepcion(cliente, sucursal));
            }
            catch (Exception ex)
            {
                LogService.Error("Error trayendo los totems de recepción de la sucursal " + sucursal, ex, "TotemsRecepcionController");
                return InternalServerError(ex);
            }
        }
    }
}
