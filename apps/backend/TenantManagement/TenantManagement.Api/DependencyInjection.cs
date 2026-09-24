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
        services.AddHttpClient();

        // Bind Clerk settings
        services.Configure<ERPEZ.TenantManagement.Api.Configuration.ClerkSettings>(
            builder.Configuration.GetSection(ERPEZ.TenantManagement.Api.Configuration.ClerkSettings.sectionName));
        var clerkSettings = builder.Configuration
            .GetSection(ERPEZ.TenantManagement.Api.Configuration.ClerkSettings.sectionName)
            .Get<ERPEZ.TenantManagement.Api.Configuration.ClerkSettings>();

        var isClerkConfigured = clerkSettings != null 
            && !string.IsNullOrWhiteSpace(clerkSettings.Authority) 
            && !clerkSettings.Authority.Contains("placeholder")
            && !clerkSettings.Authority.Contains("example.com")
            && !clerkSettings.Authority.Contains("dev.nextstep-software.com");
        var devSecurityKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
            System.Text.Encoding.UTF8.GetBytes("ERPEZ_Development_Symmetric_Signing_Key_2026_Secure_Secret_12345!"));

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            if (isClerkConfigured)
            {
                options.Authority = clerkSettings!.Authority;
                options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
                if (!string.IsNullOrWhiteSpace(clerkSettings.Audience))
                {
                    options.Audience = clerkSettings.Audience;
                }
            }

            options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
            {
                ValidateIssuer = isClerkConfigured && !builder.Environment.IsDevelopment(),
                ValidIssuer = isClerkConfigured ? clerkSettings!.Authority : null,
                ValidateAudience = false,
                ValidateLifetime = isClerkConfigured && !builder.Environment.IsDevelopment(),
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
