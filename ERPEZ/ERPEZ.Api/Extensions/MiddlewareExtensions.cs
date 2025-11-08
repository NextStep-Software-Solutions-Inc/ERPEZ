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
        // Configure the HTTP request pipeline.
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

        // Use CORS policy based on environment name (development/production)
        app.UseCors(app.Environment.EnvironmentName.ToLower());
        app.UseResponseCaching(); // Enable response caching
        app.UseResponseCompression(); // Enable response compression

        app.UseHttpsRedirection();

        // Use our global exception handler (registered via DI)
        app.UseExceptionHandler();

        // Add Hangfire Dashboard endpoint
        app.UseHangfireDashboard();

        return app;
    }
}
