using System.Configuration;
using System.Web.Http;
using System.Web.Http.Cors;
using TotemApi.Helpers;

namespace TotemApi
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.MessageHandlers.Add(new JwtAuthHandler());

            var origins = ConfigurationManager.AppSettings["CorsOrigins"];
            config.EnableCors(new EnableCorsAttribute(string.IsNullOrWhiteSpace(origins) ? "*" : origins, "*", "*"));

            config.MapHttpAttributeRoutes();

            config.Formatters.Remove(config.Formatters.XmlFormatter);
            config.Formatters.JsonFormatter.SerializerSettings.ReferenceLoopHandling =
                Newtonsoft.Json.ReferenceLoopHandling.Ignore;
        }
    }
}
