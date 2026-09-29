using ERPEZ.Api.Configuration;
using ERPEZ.Api.Extensions;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Infrastructure.Services;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Interceptors;
using ERPEZ.Shared.Interfaces;
using ERPEZ.Shared.Middlewares;
using ERPEZ.Shared.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System.Text.Json.Serialization;

namespace ERPEZ.Api;

public static class DependencyInjection
{
    public static WebApplicationBuilder AddApiServices(this WebApplicationBuilder builder)
    {
        var services = builder.Services;
        var configuration = builder.Configuration;
        var env = builder.Environment;
        
        // 1. Bind the AzureBlobStorage section to the Options class
        services.Configure<AzureBlobStorageOptions>(options => 
        {
            configuration.GetSection("AzureBlobStorage").Bind(options);
        });

        services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });

        services.AddEndpointsApiExplorer();
        services.AddJwtAuthentication(configuration, env);

        services.Configure<Microsoft.AspNetCore.Builder.ForwardedHeadersOptions>(options =>
        {
            options.ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor |
                                      Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto |
                                      Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedHost;
        });

        services.AddHttpClient("TenantManagementApi");
        services.AddMemoryCache();
        services.AddScoped<TenantRequestContext>();
        services.AddScoped<ITenantContextService>(sp => sp.GetRequiredService<TenantRequestContext>());
        services.AddScoped<ITenantRequestContext>(sp => sp.GetRequiredService<TenantRequestContext>());
        services.AddScoped<ITenantConnectionProvider, TenantConnectionProvider>();
        services.AddScoped<IUserAuthorizationService, DashboardUserAuthorizationService>();
        services.AddScoped<ILicenseConsumptionService, LicenseConsumptionService>();
        services.AddSingleton<IAuthorizationPolicyProvider, DynamicAuthorizationPolicyProvider>();
        services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();
        services.AddAuthorization();
        
        services.AddSwaggerGen(c =>
        {
            // Use fully-qualified type names as schema IDs to prevent duplicate simple names
            // from colliding (e.g., different SDGResponse types in different namespaces).
            c.CustomSchemaIds(type => type.FullName?.Replace('+', '.') ?? type.Name);
            c.AddJwtSecurityDefinition();
            
            // Handle file uploads with [FromForm] attribute
            c.OperationFilter<SwaggerFileOperationFilter>();

            // Break circular $refs caused by self-referential DTOs (ObjectResponse.Parent,
            // DeliveryUnitResponse.SubDeliveryUnits, OfficeHierarchyResponse.Children).
            // Without this, Swagger UI hangs for seconds whenever one of these endpoints is clicked.
            c.SchemaFilter<BreakCircularReferenceSchemaFilter>();
        });
        
        services.AddCorsPolicies(configuration); // Register CORS policies from extension method
        services.AddResponseCaching();
        services.AddResponseCompression();
        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();
        return builder;
    }
}
