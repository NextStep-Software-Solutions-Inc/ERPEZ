using ERPEZ.Api.Configuration;
using ERPEZ.Api.Extensions;
using ERPEZ.Infrastructure.Services;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Interceptors;
using ERPEZ.Shared.Interfaces;
using ERPEZ.Shared.Middlewares;
using ERPEZ.Shared.Services;
using ERPEZ.TenantManagement.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using TenantDbContext = ERPEZ.TenantManagement.Infrastructure.Persistence.ApplicationDbContext;

namespace ERPEZ.Api;

public static class DependencyInjection
{
    public static WebApplicationBuilder AddApiServices(this WebApplicationBuilder builder)
    {
        var services = builder.Services;
        var configuration = builder.Configuration;
        
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
        services.AddJwtAuthentication(configuration);

        // Dynamic Authorization & Tenant Services
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<TenantDbContext>((sp, options) =>
        {
            options.UseNpgsql(connectionString);
            options.AddInterceptors(sp.GetRequiredService<AuditingInterceptor>());
        });

        services.AddMemoryCache();
        services.AddScoped<ITenantContextService, TenantContextService>();
        services.AddScoped<IUserAuthorizationService, UserAuthorizationService>();
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
