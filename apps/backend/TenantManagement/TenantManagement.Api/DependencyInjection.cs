using ERPEZ.Shared.Middlewares;
using ERPEZ.TenantManagement.Api.Extensions;
using Microsoft.OpenApi.Models;

namespace ERPEZ.TenantManagement.Api;

public static class DependencyInjection
{
    public static WebApplicationBuilder AddApiServices(this WebApplicationBuilder builder)
    {
        var services = builder.Services;
        services.AddControllers();
        services.AddEndpointsApiExplorer();
        services.AddAuthentication();
        services.AddAuthorization();
        services.AddResponseCaching();
        services.AddResponseCompression();
        services.AddCorsPolicies(builder.Configuration);
        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();
        services.AddSwaggerGen(c =>
        {
            // Define the Security Scheme (Bearer token input box in Swagger UI)
            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                In = ParameterLocation.Header,
                Description = "Please enter a valid JWT token into the field (e.g., 'Bearer {your token}')",
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                BearerFormat = "JWT",
                Scheme = "Bearer"
            });

            // Define the Security Requirement (what endpoints require this scheme)
            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });

            // Ensure unique schema ids across assemblies (avoid collisions when classes share names)
            c.CustomSchemaIds(type => type.FullName?.Replace('+', '.') ?? type.Name);
        });
        return builder;
    }
}
