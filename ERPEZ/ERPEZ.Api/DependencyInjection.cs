using ERPEZ.Shared.Middlewares;
using ERPEZ.Api.Extensions;

namespace ERPEZ.Api;

public static class DependencyInjection
{
    public static WebApplicationBuilder AddApiServices(this WebApplicationBuilder builder)
    {
        var services = builder.Services;
        services.AddControllers();
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();
        services.AddCorsPolicies(builder.Configuration); // Register CORS policies from extension method
        services.AddResponseCaching();
        services.AddResponseCompression();
        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();
        return builder;
    }
}
