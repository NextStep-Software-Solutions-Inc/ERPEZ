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
        // 1. Extract JWT claim candidate
        Guid? claimCandidate = null;
        var tenantClaim = context.User.FindFirstValue(claimTenantId)
            ?? context.User.FindFirstValue(altClaimTenantId);

        if (!string.IsNullOrWhiteSpace(tenantClaim) && Guid.TryParse(tenantClaim, out var parsedClaim))
        {
            claimCandidate = parsedClaim;
        }

        // 2. Extract header candidate
        Guid? headerCandidate = null;
        if (context.Request.Headers.TryGetValue(headerTenantId, out var headerVal) &&
            Guid.TryParse(headerVal.FirstOrDefault(), out var parsedHeader))
        {
            headerCandidate = parsedHeader;
        }

        // 3. Evaluate Precedence and Conflict Rules
        Guid? resolvedCandidate = null;

        if (claimCandidate.HasValue && headerCandidate.HasValue)
        {
            if (claimCandidate.Value != headerCandidate.Value)
            {
                // Conflict detected: token claim contradicts request header
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/json";
                var errorResponse = ApiResponse<object>.Fail("Conflicting tenant selectors provided in token and header.");
                await context.Response.WriteAsync(JsonSerializer.Serialize(errorResponse));
                return;
            }

            resolvedCandidate = claimCandidate.Value;
        }
        else if (claimCandidate.HasValue)
        {
            resolvedCandidate = claimCandidate.Value;
        }
        else if (headerCandidate.HasValue)
        {
            resolvedCandidate = headerCandidate.Value;
        }

        if (resolvedCandidate.HasValue)
        {
            context.Items[candidateTenantItemKey] = resolvedCandidate.Value;
        }

        await next(context);
    }
}
