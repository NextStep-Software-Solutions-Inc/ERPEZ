using ERPEZ.TenantManagement.Api.Configuration;

namespace ERPEZ.TenantManagement.Api.Extensions;

public static class CorsExtensions
{
    /// <summary>
    /// Registers CORS policies used by the API.
    /// </summary>
    public static IServiceCollection AddCorsPolicies(this IServiceCollection services, IConfiguration configuration)
    {

        var corsSettings = new CorsSettings();
        configuration.GetSection("Cors").Bind(corsSettings);  // Manual bind for static CORS policies

        services.AddCors(options =>
        {
            options.AddPolicy("development",
                builder =>
                {
                    builder.SetIsOriginAllowed(_ => true)
                           .AllowAnyMethod()
                           .AllowAnyHeader()
                           .AllowCredentials();
                });

            options.AddPolicy("production",
                builder =>
                {
                    builder.WithOrigins(corsSettings.Origins)
                           .AllowAnyMethod()
                           .AllowAnyHeader();
                });
        });

        return services;
    }
}
