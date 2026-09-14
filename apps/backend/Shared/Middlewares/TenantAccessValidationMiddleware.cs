using System.Text.Json;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;

namespace ERPEZ.Shared.Middlewares;

/// <summary>
/// Authoritative gatekeeper middleware.
/// Validates tenant invariants and caller membership via ITenantAccessService.
/// Only after authorization succeeds does it asynchronously resolve connection metadata and initialize ITenantRequestContext.
/// </summary>
public class TenantAccessValidationMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(
        HttpContext context,
        ITenantAccessService accessService,
        ITenantConnectionResolver connectionResolver,
        ITenantRequestContext requestContext)
    {
        var endpoint = context.GetEndpoint();
        var isAllowAnonymous = endpoint?.Metadata.GetMetadata<IAllowAnonymous>() != null;
        var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;

        // Skip tenant validation for purely public/discovery routes and platform-plane routes
        var isPlatformRoute = path.StartsWith("/api/platform");
        var isPublicInfrastructureRoute = path.StartsWith("/swagger") ||
                                          path.StartsWith("/health") ||
                                          path.StartsWith("/auth/dev");

        if (isAllowAnonymous || isPublicInfrastructureRoute || isPlatformRoute)
        {
            await next(context);
            return;
        }

        // Formal authorization failure precedence:
        // 1. Invalid / missing JWT -> 401 Unauthorized
        if (context.User?.Identity?.IsAuthenticated != true)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";
            var err = ApiResponse<object>.Fail("Authentication credentials missing or invalid.");
            await context.Response.WriteAsync(JsonSerializer.Serialize(err));
            return;
        }

        Guid? candidateTenantId = null;
        if (context.Items.TryGetValue(TenantResolutionMiddleware.candidateTenantItemKey, out var itemVal) &&
            itemVal is Guid guidVal)
        {
            candidateTenantId = guidVal;
        }

        // 2. Missing / malformed X-Tenant-Id -> 400 Bad Request
        if (!candidateTenantId.HasValue)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            context.Response.ContentType = "application/json";
            var err = ApiResponse<object>.Fail("Active tenant context is required. Please specify a tenant.");
            await context.Response.WriteAsync(JsonSerializer.Serialize(err));
            return;
        }

        try
        {
            // Candidate tenant provided: execute authoritative access evaluation
            var accessResult = await accessService.EvaluateAccessAsync(
                context.User,
                candidateTenantId.Value,
                context.Request.Host.Host,
                context.RequestAborted);

            if (!accessResult.IsAllowed)
            {
                if (context.RequestAborted.IsCancellationRequested)
                {
                    return;
                }

                context.Response.StatusCode = accessResult.HttpStatusCode;
                context.Response.ContentType = "application/json";
                var err = ApiResponse<object>.Fail(accessResult.FailureReason ?? "Access denied.");
                await context.Response.WriteAsync(JsonSerializer.Serialize(err));
                return;
            }

            // CRITICAL INVARIANT: Connection information is resolved strictly AFTER authorization succeeds
            var connectionInfo = await connectionResolver.ResolveConnectionInfoAsync(
                candidateTenantId.Value,
                context.RequestAborted);

            if (connectionInfo == null || string.IsNullOrWhiteSpace(connectionInfo.ConnectionString))
            {
                if (context.RequestAborted.IsCancellationRequested)
                {
                    return;
                }

                context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
                context.Response.ContentType = "application/json";
                var err = ApiResponse<object>.Fail("Operational database connection could not be established for this tenant.");
                await context.Response.WriteAsync(JsonSerializer.Serialize(err));
                return;
            }

            // Initialize scoped request context with verified governance and infrastructure state
            requestContext.Initialize(accessResult.Context!, connectionInfo);

            await next(context);
        }
        catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
        {
            // Client closed connection or aborted the HTTP request before completion. Exit gracefully.
        }
    }
}
