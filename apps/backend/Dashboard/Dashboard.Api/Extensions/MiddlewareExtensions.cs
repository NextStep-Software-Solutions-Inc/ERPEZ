using ERPEZ.Infrastructure.Services;
using Hangfire;

namespace ERPEZ.Api.Extensions;

public static class MiddlewareExtensions
{
    /// <summary>
    /// Registers the common middleware pipeline for the API.
    /// </summary>
    public static WebApplication UseApiMiddlewares(this WebApplication app)
    {
        // 1. Exception handling FIRST (catches errors from all middleware)
        app.UseExceptionHandler();

        // 2. CORS (MUST be executed before HttpsRedirection so CORS preflight requests receive headers)
        app.UseCors(app.Environment.EnvironmentName.ToLower());

        // 3. HTTPS redirection (disabled in Development to avoid 307 preflight CORS stalls)
        if (!app.Environment.IsDevelopment())
        {
            app.UseHttpsRedirection();
        }

        // 4. Swagger (development only)
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(options =>
            {
                options.EnablePersistAuthorization();
                options.DisplayRequestDuration();
                options.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
                options.DefaultModelsExpandDepth(-1); // Disable schema section
                options.DefaultModelExpandDepth(1);   // Only expand one level deep inline per endpoint
                options.EnableDeepLinking();
            });
        }

        // 5. Routing
        app.UseRouting();

        // 6. Authentication (after routing)
        app.UseAuthentication();

        // 7. Authorization (after authentication)
        app.UseAuthorization();

        // 8. Response caching/compression (after auth, before endpoints)
        app.UseResponseCaching();
        app.UseResponseCompression();

        // 9. Hangfire Dashboard endpoint & PSDBM automated recurring jobs
        app.UseHangfireDashboard();
        app.UsePsdbmRecurringJobs();

        return app;
    }
}
