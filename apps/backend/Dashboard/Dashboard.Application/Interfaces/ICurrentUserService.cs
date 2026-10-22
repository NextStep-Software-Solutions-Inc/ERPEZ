namespace ERPEZ.Application.Interfaces;

/// <summary>
/// Service for accessing the currently authenticated user's information.
/// </summary>
public interface ICurrentUserService
{
    /// <summary>
    /// Gets the unique identifier of the current user from JWT token (sub claim).
    /// </summary>
    string? UserId { get; }

    /// <summary>
    /// Gets the username/employee number of the current user.
    /// </summary>
    string? Username { get; }

    /// <summary>
    /// Gets the email address of the current user.
    /// </summary>
    string? Email { get; }

    /// <summary>
    /// Gets the display name of the current user.
    /// </summary>
    string? Name { get; }

    /// <summary>
    /// Gets the roles assigned to the current user.
    /// </summary>
    IEnumerable<string> Roles { get; }

    /// <summary>
    /// Gets the office/department ID of the current user.
    /// </summary>
    Guid? OfficeId { get; }

    /// <summary>
    /// Gets whether the user is authenticated.
    /// </summary>
    bool IsAuthenticated { get; }

    /// <summary>
    /// Checks if the current user has a specific role.
    /// </summary>
    bool IsInRole(string role);

    /// <summary>
    /// Checks if the current user is a Planning user (has access to global dashboard).
    /// </summary>
    bool IsPlanningUser { get; }

    /// <summary>
    /// Checks if the current user is an Office user (department-scoped access).
    /// </summary>
    bool IsOfficeUser { get; }
}
