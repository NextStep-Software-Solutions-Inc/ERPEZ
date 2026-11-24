using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Middlewares;
using ERPEZ.Shared.Security;
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
        services.AddHttpClient();

        // Bind Clerk settings
        services.Configure<ERPEZ.TenantManagement.Api.Configuration.ClerkSettings>(
            builder.Configuration.GetSection(ERPEZ.TenantManagement.Api.Configuration.ClerkSettings.sectionName));
        var clerkSettings = builder.Configuration
            .GetSection(ERPEZ.TenantManagement.Api.Configuration.ClerkSettings.sectionName)
            .Get<ERPEZ.TenantManagement.Api.Configuration.ClerkSettings>();

        // Automatically resolve Authority from PublishableKey if Authority is unconfigured or placeholder
        if (clerkSettings != null && (string.IsNullOrWhiteSpace(clerkSettings.Authority) || clerkSettings.Authority.Contains("placeholder") || clerkSettings.Authority.Contains("dev.nextstep-software.com")))
        {
            var pubKey = !string.IsNullOrWhiteSpace(clerkSettings.PublishableKey) && !clerkSettings.PublishableKey.Contains("placeholder")
                ? clerkSettings.PublishableKey
                : Environment.GetEnvironmentVariable("VITE_CLERK_PUBLISHABLE_KEY") ?? Environment.GetEnvironmentVariable("CLERK_PUBLISHABLE_KEY");

            if (!string.IsNullOrWhiteSpace(pubKey) && pubKey.StartsWith("pk_"))
            {
                try
                {
                    var base64Part = pubKey.Substring(pubKey.IndexOf('_', 3) + 1);
                    while (base64Part.Length % 4 != 0) base64Part += "=";
                    var decoded = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(base64Part)).TrimEnd('$');
                    clerkSettings.Authority = $"https://{decoded}";
                }
                catch { }
            }
        }

        var isClerkConfigured = clerkSettings != null 
            && !string.IsNullOrWhiteSpace(clerkSettings.Authority) 
            && !clerkSettings.Authority.Contains("placeholder")
            && !clerkSettings.Authority.Contains("example.com");
        services.AddDualIdPAuthentication(builder.Configuration, builder.Environment);
        services.AddEndpointsApiExplorer();
        services.AddSingleton<IAuthorizationPolicyProvider, DynamicAuthorizationPolicyProvider>();
        services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();
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
