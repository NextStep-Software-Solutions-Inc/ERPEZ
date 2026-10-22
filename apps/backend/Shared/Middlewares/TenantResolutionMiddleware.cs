using System.Security.Claims;
using System.Text.Json;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Enums;
using ERPEZ.Shared.Interfaces;
using ERPEZ.Shared.Security;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace ERPEZ.Shared.Middlewares;

/// <summary>
/// Extracts and validates candidate tenant selectors from JWT claims and/or HTTP headers.
/// Enforces provider-specific normalization, conflict detection, and Model A security boundaries.
/// Does NOT treat candidate selectors as trusted authorization decisions.
/// </summary>
public class TenantResolutionMiddleware(RequestDelegate next)
{
    public const string candidateTenantItemKey = "CandidateTenantId";
    private const string claimTenantId = "tenant_id";
    private const string altClaimTenantId = "tenantId";
    private const string headerTenantId = "X-Tenant-Id";

    public static string CandidateTenantItemKey => candidateTenantItemKey;

    public async Task InvokeAsync(
        HttpContext context,
        IExternalIdentityNormalizerResolver? normalizerResolver = null)
    {
        normalizerResolver ??= context.RequestServices?.GetService<IExternalIdentityNormalizerResolver>()
            ?? new ExternalIdentityNormalizerResolver([new ClerkIdentityNormalizer(), new KeycloakIdentityNormalizer()], new Microsoft.Extensions.Configuration.ConfigurationBuilder().Build());
        var externalTenantResolver = context.RequestServices?.GetService<IExternalTenantResolver>();

        // 1. Extract header candidate (X-Tenant-Id)
        Guid? headerCandidate = null;
        if (context.Request.Headers.TryGetValue(headerTenantId, out var headerVal))
        {
            var rawHeader = headerVal.FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(rawHeader))
            {
                if (!Guid.TryParse(rawHeader, out var parsedHeader))
                {
                    context.Response.StatusCode = StatusCodes.Status400BadRequest;
                    context.Response.ContentType = "application/json";
                    var errorResponse = ApiResponse<object>.Fail("Malformed X-Tenant-Id header. Must be a valid GUID.");
                    await context.Response.WriteAsync(JsonSerializer.Serialize(errorResponse));
                    return;
                }
                headerCandidate = parsedHeader;
            }
        }

        // 2. Extract query parameter candidate (?tenantId=)
        Guid? queryCandidate = null;
        if (context.Request.Query.TryGetValue("tenantId", out var queryVal))
        {
            var rawQuery = queryVal.FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(rawQuery) && Guid.TryParse(rawQuery, out var parsedQuery))
            {
                queryCandidate = parsedQuery;
            }
        }

        // 3. Provider-aware identity normalization and conflict detection
        Guid? resolvedCandidate = null;
        var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;
        var isIdentityScopedRoute = path.Equals("/api/tenant/context", StringComparison.OrdinalIgnoreCase) ||
                                    path.Equals("/api/tenant/available", StringComparison.OrdinalIgnoreCase) ||
                                    path.Equals("/tenants/context", StringComparison.OrdinalIgnoreCase) ||
                                    path.Equals("/tenants/available", StringComparison.OrdinalIgnoreCase) ||
                                    path.Equals("/tenants/my", StringComparison.OrdinalIgnoreCase) ||
                                    path.Equals("/api/tenants/my", StringComparison.OrdinalIgnoreCase) ||
                                    (path.Equals("/tenants", StringComparison.OrdinalIgnoreCase) && HttpMethods.IsPost(context.Request.Method));

        if (context.User?.Identity?.IsAuthenticated == true)
        {
            var normalizer = normalizerResolver.Resolve(context.User);

            if (normalizer is ClerkIdentityNormalizer clerkNormalizer)
            {
                clerkNormalizer.NormalizeAndStamp(context.User);
            }
            else if (normalizer is KeycloakIdentityNormalizer keycloakNormalizer)
            {
                keycloakNormalizer.NormalizeAndStamp(context.User);
            }

            var externalOrgCandidate = normalizer.GetExternalOrganizationId(context.User);

            if (normalizer.Provider == IdentityProvider.Clerk)
            {
                if (!string.IsNullOrWhiteSpace(externalOrgCandidate))
                {
                    Guid? mappedTenantId = null;
                    if (externalTenantResolver != null)
                    {
                        mappedTenantId = await externalTenantResolver.ResolveTenantIdAsync(
                            IdentityProvider.Clerk,
                            externalOrgCandidate,
                            context.RequestAborted);
                    }
                    else if (headerCandidate.HasValue)
                    {
                        mappedTenantId = headerCandidate;
                    }

                    var currentUser = context.RequestServices?.GetService<ICurrentUserService>();
                    var isSuperAdmin = currentUser?.IsSuperAdmin ?? false;

                    if (mappedTenantId.HasValue)
                    {
                        // Conflict Detection: If caller supplied X-Tenant-Id header and it differs from mapped org -> 400 Bad Request
                        // Platform Administrators / SuperAdmins are explicitly authorized to switch across and spectate any workspace.
                        if (headerCandidate.HasValue && headerCandidate.Value != mappedTenantId.Value)
                        {
                            if (!isSuperAdmin)
                            {
                                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                                context.Response.ContentType = "application/json";
                                var errorResponse = ApiResponse<object>.Fail(new Dictionary<string, string[]> { { "code", ["TENANT_SELECTOR_CONFLICT"] } }, "Conflicting tenant selectors. The organization in your token does not match the X-Tenant-Id header.");
                                await context.Response.WriteAsync(JsonSerializer.Serialize(errorResponse));
                                return;
                            }
                            resolvedCandidate = headerCandidate.Value;
                        }
                        else
                        {
                            resolvedCandidate = mappedTenantId.Value;
                        }
                    }
                    else if (isSuperAdmin && headerCandidate.HasValue)
                    {
                        resolvedCandidate = headerCandidate.Value;
                    }
                    else if (!isIdentityScopedRoute)
                    {
                        // Unmapped organization on operational route -> 403 Forbidden (collapses with membership denial)
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        context.Response.ContentType = "application/json";
                        var errorResponse = ApiResponse<object>.Fail(new Dictionary<string, string[]> { { "code", ["TENANT_UNMAPPED"] } }, "Access denied to the requested organization.");
                        await context.Response.WriteAsync(JsonSerializer.Serialize(errorResponse));
                        return;
                    }
                }
                else
                {
                    resolvedCandidate = headerCandidate;
                }
            }
            else
            {
                // Keycloak Mode:
                // Request header is the primary candidate workspace selector (allowing workspace switching).
                // Query param is secondary.
                // JWT tenant claim is informational fallback.
                if (headerCandidate.HasValue && queryCandidate.HasValue && headerCandidate.Value != queryCandidate.Value)
                {
                    context.Response.StatusCode = StatusCodes.Status400BadRequest;
                    context.Response.ContentType = "application/json";
                    var errorResponse = ApiResponse<object>.Fail(new Dictionary<string, string[]> { { "code", ["TENANT_SELECTOR_CONFLICT"] } }, "Conflicting tenant selectors. Header and query parameter disagree.");
                    await context.Response.WriteAsync(JsonSerializer.Serialize(errorResponse));
                    return;
                }

                Guid? claimCandidate = null;
                var tenantClaim = context.User.FindFirstValue(claimTenantId)
                    ?? context.User.FindFirstValue(altClaimTenantId);

                if (!string.IsNullOrWhiteSpace(tenantClaim) && Guid.TryParse(tenantClaim, out var parsedClaim))
                {
                    claimCandidate = parsedClaim;
                }

                resolvedCandidate = headerCandidate ?? queryCandidate ?? claimCandidate;
            }
        }
        else
        {
            resolvedCandidate = headerCandidate ?? queryCandidate;
        }

        if (resolvedCandidate.HasValue)
        {
            context.Items[candidateTenantItemKey] = resolvedCandidate.Value;
        }

        await next(context);
    }
}
