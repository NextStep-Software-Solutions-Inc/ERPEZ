using ERPEZ.Shared.Middlewares;
using ERPEZ.Api.Extensions;

namespace ERPEZ.Api;

public static class DependencyInjection
{
    public static WebApplicationBuilder AddApiServices(this WebApplicationBuilder builder)
    {
        var services = builder.Services;
        var configuration = builder.Configuration;
        
        services.AddControllers();
        services.AddEndpointsApiExplorer();
        services.AddJwtAuthentication(configuration);
        services.AddAuthorization();
        
        services.AddSwaggerGen(c =>
        {
            // Use fully-qualified type names as schema IDs to prevent duplicate simple names
            // from colliding (e.g., different SDGResponse types in different namespaces).
            c.CustomSchemaIds(type => type.FullName?.Replace('+', '.') ?? type.Name);
            c.AddJwtSecurityDefinition();
        });
        
        services.AddCorsPolicies(configuration); // Register CORS policies from extension method
        services.AddResponseCaching();
        services.AddResponseCompression();
        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();
        return builder;
    }
}
