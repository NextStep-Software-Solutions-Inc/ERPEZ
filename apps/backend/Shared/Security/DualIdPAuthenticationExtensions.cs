using System.IdentityModel.Tokens.Jwt;
using System.Text;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Configuration;
using ERPEZ.Shared.Constants;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace ERPEZ.Shared.Security;

/// <summary>
/// Configures Dual-IdP authentication schemes (Clerk, Keycloak, Hybrid, and terminal RejectScheme).
/// </summary>
public static class DualIdPAuthenticationExtensions
{
    public static IServiceCollection AddDualIdPAuthentication(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        services.AddSingleton<IAuthenticationSchemeRouter, AuthenticationSchemeRouter>();
        services.AddScoped<IAuthorizationHandler, AzpAuthorizationHandler>();

        services.AddAuthorization(options =>
        {
            options.AddPolicy(AuthPolicies.browserClerkPolicy, policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.Requirements.Add(new AzpRequirement());
            });

            options.AddPolicy(AuthPolicies.serviceClerkPolicy, policy =>
            {
                policy.RequireAuthenticatedUser();
            });
        });

        var authProviderMode = configuration.GetValue<string>("AUTH_PROVIDER")?.ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(authProviderMode))
        {
            authProviderMode = environment.IsDevelopment() ? "hybrid" : "keycloak";
        }

        if (authProviderMode == "clerk")
        {
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = AuthSchemes.clerkJwt;
                options.DefaultChallengeScheme = AuthSchemes.clerkJwt;
            })
            .AddJwtBearer(AuthSchemes.clerkJwt, options =>
            {
                ConfigureClerkJwt(options, configuration, environment);
            });
        }
        else if (authProviderMode == "keycloak")
        {
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = AuthSchemes.keycloakJwt;
                options.DefaultChallengeScheme = AuthSchemes.keycloakJwt;
            })
            .AddJwtBearer(AuthSchemes.keycloakJwt, options =>
            {
                ConfigureKeycloakJwt(options, configuration, environment);
            });
        }
        else
        {
            // Hybrid mode: Dynamic routing based on token issuer with terminal rejection of unknown issuers
            services.AddAuthentication(options =>
            {
                options.DefaultScheme = AuthSchemes.dynamicScheme;
                options.DefaultAuthenticateScheme = AuthSchemes.dynamicScheme;
                options.DefaultChallengeScheme = AuthSchemes.dynamicScheme;
            })
            .AddPolicyScheme(AuthSchemes.dynamicScheme, "Dual-IdP Hybrid Router", options =>
            {
                options.ForwardDefaultSelector = context =>
                {
                    var router = context.RequestServices.GetRequiredService<IAuthenticationSchemeRouter>();
                    return router.ResolveSchemeFromContext(context);
                };
            })
            .AddScheme<AuthenticationSchemeOptions, RejectAuthenticationHandler>(
                AuthSchemes.rejectScheme, _ => { })
            .AddJwtBearer(AuthSchemes.clerkJwt, options =>
            {
                ConfigureClerkJwt(options, configuration, environment);
            })
            .AddJwtBearer(AuthSchemes.keycloakJwt, options =>
            {
                ConfigureKeycloakJwt(options, configuration, environment);
            });
        }

        return services;
    }

    private static void ConfigureClerkJwt(
        JwtBearerOptions options,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        var clerkAuthority = configuration.GetValue<string>("Clerk:Authority")?.TrimEnd('/');
        var clerkAudience = configuration.GetValue<string>("Clerk:Audience");

        var isClerkConfigured = !string.IsNullOrWhiteSpace(clerkAuthority)
            && !clerkAuthority.Contains("placeholder")
            && !clerkAuthority.Contains("example.com");

        if (isClerkConfigured)
        {
            options.Authority = clerkAuthority;
            options.RequireHttpsMetadata = !environment.IsDevelopment();
            if (!string.IsNullOrWhiteSpace(clerkAudience))
            {
                options.Audience = clerkAudience;
            }

            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuers = [clerkAuthority!, clerkAuthority + "/"],
                ValidateAudience = !string.IsNullOrWhiteSpace(clerkAudience),
                ValidAudience = clerkAudience,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true
            };
        }
        else
        {
            var devSecurityKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(DevelopmentAuthDefaults.devSigningKey));

            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = devSecurityKey
            };
        }
    }

    private static void ConfigureKeycloakJwt(
        JwtBearerOptions options,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        var kcAuthority = configuration.GetValue<string>("JwtSettings:Authority")?.TrimEnd('/');
        var kcAudience = configuration.GetValue<string>("JwtSettings:Audience");
        var devSecurityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(DevelopmentAuthDefaults.devSigningKey));

        var isRemoteKeycloak = !string.IsNullOrWhiteSpace(kcAuthority)
            && !kcAuthority.Contains("your-jwt-issuer.com")
            && !kcAuthority.Contains("placeholder");

        if (isRemoteKeycloak)
        {
            options.Authority = kcAuthority;
            options.Audience = kcAudience;
            options.RequireHttpsMetadata = false;

            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuers = [kcAuthority!, kcAuthority + "/", DevelopmentAuthDefaults.devIssuer],
                ValidateAudience = !string.IsNullOrWhiteSpace(kcAudience),
                ValidAudience = kcAudience,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKeyResolver = (token, securityToken, kid, validationParameters) =>
                {
                    var issuer = (securityToken as JsonWebToken)?.Issuer
                        ?? (securityToken as JwtSecurityToken)?.Issuer;

                    if (issuer == DevelopmentAuthDefaults.devIssuer || string.IsNullOrWhiteSpace(kid))
                    {
                        return [devSecurityKey];
                    }

                    return validationParameters?.IssuerSigningKeys ?? [devSecurityKey];
                }
            };
        }
        else
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = devSecurityKey
            };
        }
    }
}
