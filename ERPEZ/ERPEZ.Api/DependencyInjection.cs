using ERPEZ.Shared.Middlewares;
using ERPEZ.Api.Extensions;

namespace ERPEZ.Api;

public static class DependencyInjection
{
    public static IServiceCollection AddApiServices(this IServiceCollection services)
    {
        services.AddControllers();
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();
        services.AddCorsPolicies(); // Register CORS policies from extension method

        // 3. Add our custom global exception handler
        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();
        return services;
    }
}