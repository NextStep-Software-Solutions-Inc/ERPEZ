using Microsoft.Extensions.DependencyInjection;

namespace ERPEZ.Api.Extensions;

public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Registers CORS policies used by the API.
    /// </summary>
    public static IServiceCollection AddCorsPolicies(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("development",
                builder =>
                {
                    builder.AllowAnyOrigin()
                           .AllowAnyMethod()
                           .AllowAnyHeader();
                });

            options.AddPolicy("production",
                builder =>
                {
                    builder.WithOrigins("https://erpez.api.nextstep-software.com")
                           .AllowAnyMethod()
                           .AllowAnyHeader();
                });
        });

        return services;
    }
}
