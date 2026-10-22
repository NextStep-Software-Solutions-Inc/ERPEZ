using ERPEZ.Application.Common.Dtos.AMS;
using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Application.Interfaces.Services;

/// <summary>
/// Application service responsible for operational user resolution, auto-provisioning,
/// and AMS role assignments within the active tenant operational database.
/// </summary>
public interface IUserProvisioningService
{
    /// <summary>
    /// Resolves an existing operational user by ID, external identity ID, or email;
    /// if not found, auto-provisions a new User entity within the active tenant database.
    /// </summary>
    Task<User?> GetOrProvisionUserAsync(
        AssignUserRolesDto request,
        string performedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Assigns AMS roles to the target user (auto-provisioning if necessary)
    /// and invalidates the user's authorization cache.
    /// </summary>
    Task<(bool Success, string? ErrorMessage)> AssignUserRolesAsync(
        AssignUserRolesDto request,
        string performedBy,
        CancellationToken cancellationToken = default);
}
