using System;
using System.Collections.Generic;
using System.Configuration;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace TotemApi.Helpers
{
    public class JwtAuthHandler : DelegatingHandler
    {
        private static readonly HashSet<string> PublicRoutes = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "api/auth/login"
        };

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            if (request.Method == HttpMethod.Options || IsPublicRoute(request))
                return await base.SendAsync(request, cancellationToken);

            var authHeader = request.Headers.Authorization;
            if (authHeader == null || authHeader.Scheme != "Bearer" || string.IsNullOrEmpty(authHeader.Parameter))
            {
                return request.CreateResponse(HttpStatusCode.Unauthorized,
                    new { mensaje = "Token de autorización requerido" });
            }

            try
            {
                var secret = ConfigurationManager.AppSettings["JwtSecret"];
                var payload = JwtHelper.ValidateToken(authHeader.Parameter, secret);

                request.Properties["UsuarioCodigo"] = payload.ContainsKey("sub") ? payload["sub"].ToString() : "";
                request.Properties["UsuarioNombre"] = payload.ContainsKey("usuario") ? payload["usuario"].ToString() : "";
                request.Properties["Cliente"] = payload.ContainsKey("cliente") ? payload["cliente"].ToString() : "";

                return await base.SendAsync(request, cancellationToken);
            }
            catch (Exception ex)
            {
                return request.CreateResponse(HttpStatusCode.Unauthorized,
                    new { mensaje = "Token inválido: " + ex.Message });
            }
        }

        // Matches by suffix so the API works both at the site root and under an IIS virtual directory.
        private static bool IsPublicRoute(HttpRequestMessage request)
        {
            var path = request.RequestUri.AbsolutePath.TrimEnd('/');
            foreach (var route in PublicRoutes)
            {
                if (path.EndsWith("/" + route, StringComparison.OrdinalIgnoreCase))
                    return true;
            }
            return false;
        }
    }
}
