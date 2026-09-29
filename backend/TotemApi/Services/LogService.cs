using System;
using System.Configuration;
using System.IO;

namespace TotemApi.Services
{
    public static class LogService
    {
        private static readonly object _lock = new object();

        private static string GetLogDirectory()
        {
            var dir = ConfigurationManager.AppSettings["LogDirectory"];
            if (string.IsNullOrEmpty(dir))
                dir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "App_Data", "logs");

            if (!Directory.Exists(dir))
                Directory.CreateDirectory(dir);

            return dir;
        }

        private static void Write(string level, string mensaje, string origen)
        {
            try
            {
                var linea = "[" + DateTime.Now.ToString("HH:mm:ss") + "] [" + level + "]"
                    + (origen != null ? " [" + origen + "]" : "")
                    + " " + mensaje + Environment.NewLine;

                var path = Path.Combine(GetLogDirectory(), "log_" + DateTime.Now.ToString("yyyy-MM-dd") + ".txt");
                lock (_lock)
                {
                    File.AppendAllText(path, linea);
                }
            }
            catch
            {
                // Logging must never break a request.
            }
        }

        public static void Info(string mensaje, string origen = null)
        {
            Write("INFO", mensaje, origen);
        }

        public static void Error(string mensaje, Exception ex, string origen = null)
        {
            Write("ERROR", mensaje + " | " + ex.GetType().Name + ": " + ex.Message, origen);
        }
    }
}
