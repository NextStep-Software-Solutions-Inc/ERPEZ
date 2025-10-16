using ERPEZ.Shared.Middlewares;
using Microsoft.OpenApi.Models;

namespace ERPEZ.Api;

public static class DependencyInjection
{
    public static IServiceCollection AddApiServices(this IServiceCollection services)
    {
        services.AddControllers();
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            // IMPORTANT: The Title MUST match the GroupName tag used on the controllers
            c.SwaggerDoc("catalog", new OpenApiInfo { Title = "catalog", Version = "v1" });
            c.SwaggerDoc("ams", new OpenApiInfo { Title = "ams", Version = "v1" });

            // FIX: Tag actions by Controller Name. This is what creates separate collapsible sections.
            // We use the RouteValue "controller" to get the name (e.g., "Users", "KPIs").
            c.TagActionsBy(api => new[] { api.ActionDescriptor.RouteValues["controller"] });

            // Register the custom filter to handle document inclusion/exclusion
            c.DocumentFilter<SwaggerGroupFilter>();
        });

        // 3. Add our custom global exception handler
        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();
        return services;
    }
}