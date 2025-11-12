using Hangfire;

namespace ERPEZ.TenantManagement.Api.Extensions;

public static class MiddlewareExtensions
{
    /// <summary>
    /// Registers the common middleware pipeline for the API.
    /// </summary>
    public static WebApplication UseApiMiddlewares(this WebApplication app)
    {
        // 1. Exception handling FIRST (catches errors from all middleware)
        app.UseExceptionHandler();

        // 2. HTTPS redirection
        app.UseHttpsRedirection();

        // 3. Swagger (development only)
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(options =>
            {
                options.EnablePersistAuthorization();
                options.DisplayRequestDuration();
                options.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
                options.DefaultModelsExpandDepth(-1);
                options.EnableDeepLinking();
            });
        }

        // 4. Routing (required for endpoint-based middleware)
        app.UseRouting();

        // 5. CORS (after routing)
        app.UseCors(app.Environment.EnvironmentName.ToLower());

        // 6. Authentication (after routing)
        app.UseAuthentication();

        // 7. Authorization (after authentication)
        app.UseAuthorization();

        // 8. Response caching/compression (after auth, before endpoints)
        app.UseResponseCaching();
        app.UseResponseCompression();

        // 9. Hangfire Dashboard endpoint
        app.UseHangfireDashboard();

        return app;
    }
}
