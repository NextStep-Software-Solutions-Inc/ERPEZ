using ERPEZ.Shared.Middlewares;
using ERPEZ.Api.Extensions;
using ERPEZ.Api.Configuration;
using ERPEZ.Infrastructure.Services;

namespace ERPEZ.Api;

public static class DependencyInjection
{
    public static WebApplicationBuilder AddApiServices(this WebApplicationBuilder builder)
    {
        var services = builder.Services;
        var configuration = builder.Configuration;
        
        // 1. Bind the JSON section to the Options class
        // This looks for "ConnectionStrings:BlobStorage" and puts it in AzureBlobStorageOptions.ConnectionString
        services.Configure<AzureBlobStorageOptions>(options => 
        {
            options.ConnectionString = configuration.GetConnectionString("BlobStorage") ?? string.Empty;
        });

        // 2. Register the service itself if not already registered elsewhere
        // services.AddScoped<IFileStorageService, AzureBlobStorageService>();
        services.AddControllers();
        services.AddEndpointsApiExplorer();
        services.AddJwtAuthentication(configuration);
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
