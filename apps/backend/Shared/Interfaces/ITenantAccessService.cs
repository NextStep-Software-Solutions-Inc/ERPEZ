using System.Security.Claims;
using ERPEZ.Shared.Models;

namespace ERPEZ.Shared.Interfaces;

/// <summary>
/// Result of evaluating tenant access invariants.
/// </summary>
public record TenantAccessResult(
    bool IsAllowed,
    string? FailureReason,
    string? ErrorCode,
    int HttpStatusCode,
    TenantAccessContext? Context
)
{
    public static TenantAccessResult Success(TenantAccessContext context) =>
        new(true, null, null, 200, context);

    public static TenantAccessResult Fail(string failureReason, string errorCode, int httpStatusCode) =>
        new(false, failureReason, errorCode, httpStatusCode, null);
}

/// <summary>
/// Authoritative gatekeeper that validates all tenant invariants and user membership
/// before operational database credentials can be resolved or accessed.
/// </summary>
public interface ITenantAccessService
{
    /// <summary>
    /// Evaluates tenant access using the explicit TenantAccessRequest context.
    /// Distinguishes between the authorized API host reached and the client web origin.
    /// </summary>
    Task<TenantAccessResult> EvaluateAccessAsync(
        TenantAccessRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deprecated legacy overload. Scheduled for removal under tracking ticket [SEC-DEP-001] in v1.1.0.
    /// All active callers must use <see cref="EvaluateAccessAsync(TenantAccessRequest, CancellationToken)"/>.
    /// </summary>
    [Obsolete("Use EvaluateAccessAsync(TenantAccessRequest, CancellationToken) instead. Scheduled for removal in v1.1.0 under tracking ticket [SEC-DEP-001].")]
    Task<TenantAccessResult> EvaluateAccessAsync(
        ClaimsPrincipal user,
        Guid candidateTenantId,
        string requestHost,
        CancellationToken cancellationToken = default);
}
