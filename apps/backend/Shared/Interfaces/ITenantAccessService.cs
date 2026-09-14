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
    /// Evaluates tenant existence, active state, provisioning state, domain constraints,
    /// license validity, and authenticated user membership.
    /// </summary>
    Task<TenantAccessResult> EvaluateAccessAsync(
        ClaimsPrincipal user,
        Guid candidateTenantId,
        string requestHost,
        CancellationToken cancellationToken = default);
}
