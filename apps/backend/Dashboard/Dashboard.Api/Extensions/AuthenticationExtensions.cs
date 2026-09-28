using ERPEZ.Api.Configuration;
using ERPEZ.Shared.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace ERPEZ.Api.Extensions;

/// <summary>
/// Extension methods for configuring authentication in the API.
/// </summary>
public static class AuthenticationExtensions
{
    public const string devSigningKey = "ERPEZ_Development_Symmetric_Signing_Key_2026_Secure_Secret_12345!";
    public const string devIssuer = "https://erpez.dev/auth";
    public const string devAudience = "erpez-api";

    /// <summary>
    /// Registers JWT Bearer authentication and Swagger security definitions.
    /// </summary>
    public static IServiceCollection AddJwtAuthentication(
        this IServiceCollection services, 
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));
        return services.AddDualIdPAuthentication(configuration, environment);
    }

    /// <summary>
    /// Adds Swagger security definitions for JWT Bearer authentication.
    /// </summary>
    public static SwaggerGenOptions AddJwtSecurityDefinition(this SwaggerGenOptions options)
    {
        // Define the Security Scheme (Bearer token input box in Swagger UI)
        var securityScheme = new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "JWT Authorization header using the Bearer scheme. Enter your JWT token."
        };

        options.AddSecurityDefinition("Bearer", securityScheme);

        var securityRequirement = new OpenApiSecurityRequirement
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
        };

        options.AddSecurityRequirement(securityRequirement);

        return options;
    }
}
