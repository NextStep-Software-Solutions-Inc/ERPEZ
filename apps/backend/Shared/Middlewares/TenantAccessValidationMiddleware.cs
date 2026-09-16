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
        try
        {
            var endpoint = context.GetEndpoint();
            var isAllowAnonymous = endpoint?.Metadata.GetMetadata<IAllowAnonymous>() != null;
            var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;

            // Skip tenant validation for purely public/discovery routes when no candidate is supplied
            var isPublicInfrastructureRoute = path.StartsWith("/swagger") ||
                                              path.StartsWith("/health") ||
                                              path.StartsWith("/auth/dev");

            Guid? candidateTenantId = null;
            if (context.Items.TryGetValue(TenantResolutionMiddleware.candidateTenantItemKey, out var itemVal) &&
                itemVal is Guid guidVal)
            {
                candidateTenantId = guidVal;
            }

            if (!candidateTenantId.HasValue)
            {
                if (isAllowAnonymous || isPublicInfrastructureRoute)
                {
                    await next(context);
                    return;
                }

                // Authenticated request attempting to access operational resources without a tenant
                if (context.User?.Identity?.IsAuthenticated == true)
                {
                    context.Response.StatusCode = StatusCodes.Status400BadRequest;
                    context.Response.ContentType = "application/json";
                    var err = ApiResponse<object>.Fail("Active tenant context is required. Please specify a tenant.");
                    await context.Response.WriteAsync(JsonSerializer.Serialize(err));
                    return;
                }

                // Unauthenticated: let UseAuthentication / UseAuthorization challenge with 401
                await next(context);
                return;
            }

            // Candidate tenant provided: execute authoritative access evaluation
            var accessResult = await accessService.EvaluateAccessAsync(
                context.User,
                candidateTenantId.Value,
                context.Request.Host.Host,
                context.RequestAborted);

            if (!accessResult.IsAllowed)
            {
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
            // Client canceled or aborted the HTTP request; terminate pipeline gracefully
        }
    }
}
