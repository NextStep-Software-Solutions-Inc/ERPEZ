using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Middlewares;
using ERPEZ.TenantManagement.Api.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Models;

namespace ERPEZ.TenantManagement.Api;

public static class DependencyInjection
{
    public static WebApplicationBuilder AddApiServices(this WebApplicationBuilder builder)
    {
        var services = builder.Services;
        services.AddControllers();
        var devSecurityKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
            System.Text.Encoding.UTF8.GetBytes("ERPEZ_Development_Symmetric_Signing_Key_2026_Secure_Secret_12345!"));

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = devSecurityKey
            };
        });
        services.AddEndpointsApiExplorer();
        services.AddSingleton<IAuthorizationPolicyProvider, DynamicAuthorizationPolicyProvider>();
        services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();
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
                Description = "Please enter your JWT token (do not include the 'Bearer ' prefix, Swagger adds it automatically)",
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
