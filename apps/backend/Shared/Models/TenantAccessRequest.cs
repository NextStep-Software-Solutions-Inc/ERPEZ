using System.Security.Claims;

namespace ERPEZ.Shared.Models;

/// <summary>
/// Encapsulates the complete security boundary context for tenant access evaluation.
/// Explicitly distinguishes between the API host reached and the client origin initiating the request.
/// </summary>
public sealed record TenantAccessRequest(
    ClaimsPrincipal User,
    Guid TenantId,
    string ApiHost,
    Uri? ClientOrigin);
