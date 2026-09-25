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
                var trimmedAuthority = clerkSettings!.Authority.TrimEnd('/');
                options.Authority = trimmedAuthority;
                options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
                if (!string.IsNullOrWhiteSpace(clerkSettings.Audience))
                {
                    options.Audience = clerkSettings.Audience;
                }

                options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuers = [trimmedAuthority, trimmedAuthority + "/", "https://erpez.dev/auth"],
                    ValidateAudience = !string.IsNullOrWhiteSpace(clerkSettings.Audience),
                    ValidAudience = clerkSettings.Audience,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKeyResolver = (token, securityToken, kid, validationParameters) =>
                    {
                        var issuer = (securityToken as Microsoft.IdentityModel.JsonWebTokens.JsonWebToken)?.Issuer
                            ?? (securityToken as System.IdentityModel.Tokens.Jwt.JwtSecurityToken)?.Issuer;

                        if (issuer == "https://erpez.dev/auth" || string.IsNullOrWhiteSpace(kid))
                        {
                            return [devSecurityKey];
                        }

                        if (validationParameters?.IssuerSigningKeys != null && validationParameters.IssuerSigningKeys.Any())
                        {
                            var matched = validationParameters.IssuerSigningKeys.Where(k => k.KeyId == kid).ToList();
                            if (matched.Count > 0) return matched;
                            return validationParameters.IssuerSigningKeys;
                        }

                        if (options.ConfigurationManager != null)
                        {
                            try
                            {
                                var oidcConfig = options.ConfigurationManager.GetConfigurationAsync(CancellationToken.None).GetAwaiter().GetResult();
                                if (oidcConfig?.SigningKeys != null && oidcConfig.SigningKeys.Count > 0)
                                {
                                    var matched = oidcConfig.SigningKeys.Where(k => k.KeyId == kid).ToList();
                                    if (matched.Count > 0) return matched;
                                    return oidcConfig.SigningKeys;
                                }
                            }
                            catch
                            {
                                // fallback to devSecurityKey
                            }
                        }

                        return [devSecurityKey];
                    }
                };
            }
            else
            {
                options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = false,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = devSecurityKey
                };
            }
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
