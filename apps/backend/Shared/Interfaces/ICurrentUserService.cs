namespace ERPEZ.Shared.Interfaces;

/// <summary>
/// Service for accessing the currently authenticated user's security and identity context.
/// </summary>
public interface ICurrentUserService
{
    /// <summary>
    /// The external identity ID from JWT (sub claim), representing Keycloak subject ID.
    /// </summary>
    string? ExternalIdentityId { get; }

    /// <summary>
    /// Returns the external identity id for backwards compatibility.
    /// </summary>
    string? UserId { get; }

    /// <summary>
    /// Email address of the authenticated user.
    /// </summary>
    string? Email { get; }

    /// <summary>
    /// Username / preferred username of the authenticated user.
    /// </summary>
    string? Username { get; }

    /// <summary>
    /// Full display name of the authenticated user.
    /// </summary>
    string? FullName { get; }

    /// <summary>
    /// Indicates whether the user is authenticated.
    /// </summary>
    bool IsAuthenticated { get; }

    /// <summary>
    /// Indicates whether the user possesses global SuperAdmin authority.
    /// </summary>
    bool IsSuperAdmin { get; }

    /// <summary>
    /// Office ID extracted from token claims (if present).
    /// </summary>
    Guid? OfficeId { get; }

    /// <summary>
    /// Functional / token roles assigned to the user.
    /// </summary>
    IReadOnlyList<string> Roles { get; }

    /// <summary>
    /// Checks if the user is in a specific role.
    /// </summary>
    bool IsInRole(string role);
}
