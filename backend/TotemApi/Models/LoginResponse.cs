using System.Collections.Generic;

namespace TotemApi.Models
{
    public class LoginResponse
    {
        public string Token { get; set; }
        public Usuario Usuario { get; set; }
        public List<Sucursal> Sucursales { get; set; }
    }
}
