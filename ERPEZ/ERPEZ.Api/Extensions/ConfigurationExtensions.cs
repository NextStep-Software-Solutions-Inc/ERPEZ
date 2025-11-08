using ERPEZ.Api.Configuration;

namespace ERPEZ.Api.Extensions;

public static class ConfigurationExtensions
{
    /// <summary>
    /// Centralizes registration of configuration sources (appsettings and user secrets).
    /// </summary>
    public static WebApplicationBuilder ConfigureAppConfiguration(this WebApplicationBuilder builder)
    {
        var env = builder.Environment;

        builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
        builder.Configuration.AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true, reloadOnChange: true);
        builder.Configuration.AddUserSecrets(typeof(Program).Assembly, optional: true);

        builder.Services.Configure<CorsSettings>(builder.Configuration.GetSection("Cors"));

        return builder;
    }
}
