using ERPEZ.Shared.Middlewares;
using ERPEZ.Api.Extensions;
using ERPEZ.Api.Configuration;

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

        // 3. Add our custom global exception handler
        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();
        return builder;
    }
}