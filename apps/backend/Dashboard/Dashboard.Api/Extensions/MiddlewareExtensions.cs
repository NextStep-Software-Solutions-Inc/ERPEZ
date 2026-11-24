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
        // 0. Forwarded Headers FIRST (process trusted proxy headers)
        app.UseForwardedHeaders();

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

        // 6.1 Tenant Resolution (extracts candidate tenant from JWT or header; detects conflicts)
        app.UseMiddleware<ERPEZ.Shared.Middlewares.TenantResolutionMiddleware>();

        // 6.2 Authoritative Tenant Access Gatekeeper (validates invariants & resolves connection info post-authorization)
        app.UseMiddleware<ERPEZ.Shared.Middlewares.TenantAccessValidationMiddleware>();

        // 6.3 Keycloak Just-In-Time User Provisioning into Dashboard DB (runs before Authorization so JIT roles are provisioned prior to permission evaluation)
        app.UseMiddleware<ERPEZ.Infrastructure.Middlewares.KeycloakUserProvisioningMiddleware>();

        // 7. Authorization (after authentication & JIT provisioning)
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
