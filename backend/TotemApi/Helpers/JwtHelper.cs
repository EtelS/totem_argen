using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using Newtonsoft.Json;
using TotemApi.Models;

namespace TotemApi.Helpers
{
    public static class JwtHelper
    {
        public static string GenerateToken(Usuario usuario, string secret, int expirationMinutes)
        {
            var header = new Dictionary<string, object>
            {
                { "alg", "HS256" },
                { "typ", "JWT" }
            };

            var payload = new Dictionary<string, object>
            {
                { "sub", usuario.Codigo.ToString() },
                { "name", usuario.NombreCompleto },
                { "usuario", usuario.NombreUsuario },
                { "cliente", usuario.Cliente },
                { "iat", DateTimeOffset.UtcNow.ToUnixTimeSeconds() },
                { "exp", DateTimeOffset.UtcNow.AddMinutes(expirationMinutes).ToUnixTimeSeconds() }
            };

            var headerBase64 = Base64UrlEncode(Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(header)));
            var payloadBase64 = Base64UrlEncode(Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(payload)));
            var signature = Sign(headerBase64 + "." + payloadBase64, secret);

            return headerBase64 + "." + payloadBase64 + "." + signature;
        }

        public static Dictionary<string, object> ValidateToken(string token, string secret)
        {
            var parts = token.Split('.');
            if (parts.Length != 3)
                throw new Exception("Token inválido");

            var expectedSignature = Sign(parts[0] + "." + parts[1], secret);
            if (!FixedTimeEquals(parts[2], expectedSignature))
                throw new Exception("Firma del token inválida");

            var payloadJson = Encoding.UTF8.GetString(Base64UrlDecode(parts[1]));
            var payload = JsonConvert.DeserializeObject<Dictionary<string, object>>(payloadJson);

            if (!payload.ContainsKey("exp"))
                throw new Exception("Token sin expiración");

            var exp = Convert.ToInt64(payload["exp"]);
            if (DateTimeOffset.UtcNow.ToUnixTimeSeconds() > exp)
                throw new Exception("Token expirado");

            return payload;
        }

        private static string Sign(string input, string secret)
        {
            using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret)))
            {
                return Base64UrlEncode(hmac.ComputeHash(Encoding.UTF8.GetBytes(input)));
            }
        }

        private static bool FixedTimeEquals(string a, string b)
        {
            if (a.Length != b.Length)
                return false;

            var diff = 0;
            for (var i = 0; i < a.Length; i++)
                diff |= a[i] ^ b[i];
            return diff == 0;
        }

        private static string Base64UrlEncode(byte[] bytes)
        {
            return Convert.ToBase64String(bytes).Replace('+', '-').Replace('/', '_').TrimEnd('=');
        }

        private static byte[] Base64UrlDecode(string input)
        {
            var base64 = input.Replace('-', '+').Replace('_', '/');
            switch (base64.Length % 4)
            {
                case 2: base64 += "=="; break;
                case 3: base64 += "="; break;
            }
            return Convert.FromBase64String(base64);
        }
    }
}
