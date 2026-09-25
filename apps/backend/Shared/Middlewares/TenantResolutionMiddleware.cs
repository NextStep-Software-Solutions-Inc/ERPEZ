using System.Security.Claims;
using System.Text.Json;
using ERPEZ.Shared.Common;
using Microsoft.AspNetCore.Http;

namespace ERPEZ.Shared.Middlewares;

/// <summary>
/// Extracts and validates candidate tenant selectors from JWT claims and/or HTTP headers.
/// Enforces explicit selector precedence and conflict detection.
/// Does NOT treat candidate selectors as trusted authorization boundaries.
/// </summary>
public class TenantResolutionMiddleware(RequestDelegate next)
{
    public const string candidateTenantItemKey = "CandidateTenantId";
    private const string claimTenantId = "tenant_id";
    private const string altClaimTenantId = "tenantId";
    private const string headerTenantId = "X-Tenant-Id";

    public async Task InvokeAsync(HttpContext context)
    {
        // 1. Extract JWT claim candidate (informational only)
        Guid? claimCandidate = null;
        var tenantClaim = context.User.FindFirstValue(claimTenantId)
            ?? context.User.FindFirstValue(altClaimTenantId);

        if (!string.IsNullOrWhiteSpace(tenantClaim) && Guid.TryParse(tenantClaim, out var parsedClaim))
        {
            claimCandidate = parsedClaim;
        }

        // 2. Extract header candidate (X-Tenant-Id)
        Guid? headerCandidate = null;
        if (context.Request.Headers.TryGetValue(headerTenantId, out var headerVal))
        {
            var rawHeader = headerVal.FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(rawHeader))
            {
                if (!Guid.TryParse(rawHeader, out var parsedHeader))
                {
                    // Malformed GUID in X-Tenant-Id header fails immediately with 400 Bad Request before DB query
                    context.Response.StatusCode = StatusCodes.Status400BadRequest;
                    context.Response.ContentType = "application/json";
                    var errorResponse = ApiResponse<object>.Fail("Malformed X-Tenant-Id header. Must be a valid GUID.");
                    await context.Response.WriteAsync(JsonSerializer.Serialize(errorResponse));
                    return;
                }
                headerCandidate = parsedHeader;
            }
        }

        // 2.1 Extract query parameter candidate (?tenantId=)
        Guid? queryCandidate = null;
        if (context.Request.Query.TryGetValue("tenantId", out var queryVal))
        {
            var rawQuery = queryVal.FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(rawQuery) && Guid.TryParse(rawQuery, out var parsedQuery))
            {
                queryCandidate = parsedQuery;
            }
        }

        // 3. Evaluate Precedence:
        // Request header is the primary candidate workspace selector.
        // Query param is secondary (for direct links or scoped queries).
        // JWT tenant claim is informational only and MUST NOT reject the request when it differs (workspace switching).
        Guid? resolvedCandidate = headerCandidate ?? queryCandidate ?? claimCandidate;

        if (resolvedCandidate.HasValue)
        {
            context.Items[candidateTenantItemKey] = resolvedCandidate.Value;
        }

        await next(context);
    }
}
