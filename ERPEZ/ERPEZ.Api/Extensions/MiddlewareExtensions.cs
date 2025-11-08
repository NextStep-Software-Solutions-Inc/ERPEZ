using Hangfire;
using Microsoft.AspNetCore.Builder;

namespace ERPEZ.Api.Extensions;

public static class MiddlewareExtensions
{
    /// <summary>
    /// Registers the common middleware pipeline for the API.
    /// </summary>
    public static WebApplication UseApiMiddlewares(this WebApplication app)
    {
        // Use CORS policy based on environment name (development/production)
        app.UseCors(app.Environment.EnvironmentName.ToLower());

        app.UseHttpsRedirection();

        // Use our global exception handler (registered via DI)
        app.UseExceptionHandler();

        // Add Hangfire Dashboard endpoint
        app.UseHangfireDashboard();

        return app;
    }
}
