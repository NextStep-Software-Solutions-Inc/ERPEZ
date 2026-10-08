using ERPEZ.Application.Common.Dtos.AMS;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.AMS;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Shared.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ERPEZ.Infrastructure.Services;

/// <summary>
/// Operational user provisioning and role assignment service.
/// Decouples entity auto-provisioning and role mutation from API controllers.
/// </summary>
public class UserProvisioningService(
    ApplicationDbContext dbContext,
    IUserAuthorizationService authorizationService,
    ILogger<UserProvisioningService> logger) : IUserProvisioningService
{
    public async Task<User?> GetOrProvisionUserAsync(
        AssignUserRolesDto request,
        string performedBy,
        CancellationToken cancellationToken = default)
    {
        User? user = null;

        // 1. Try finding by ExternalIdentityId if provided (canonical federated ID)
        if (!string.IsNullOrWhiteSpace(request.ExternalIdentityId))
        {
            user = await dbContext.Users!
                .Include(u => u.RoleAssignments)
                .FirstOrDefaultAsync(u => u.ExternalIdentityId == request.ExternalIdentityId && !u.IsDeleted, cancellationToken);
        }

        // 2. Try finding by UserId if provided
        if (user == null && request.UserId.HasValue && request.UserId.Value != Guid.Empty)
        {
            user = await dbContext.Users!
                .Include(u => u.RoleAssignments)
                .FirstOrDefaultAsync(u => u.Id == request.UserId.Value && !u.IsDeleted, cancellationToken);
        }

        // 3. Try finding by Email if provided
        if (user == null && !string.IsNullOrWhiteSpace(request.Email))
        {
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            user = await dbContext.Users!
                .Include(u => u.RoleAssignments)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail && !u.IsDeleted, cancellationToken);
        }

        // 4. Auto-provision if user does not exist in operational database
        if (user == null)
        {
            if (string.IsNullOrWhiteSpace(request.Email) && string.IsNullOrWhiteSpace(request.FullName))
            {
                logger.LogWarning("Cannot auto-provision user without email or name. ExternalIdentityId: {ExternalId}", request.ExternalIdentityId);
                return null;
            }

            var email = !string.IsNullOrWhiteSpace(request.Email) ? request.Email.Trim() : $"{Guid.NewGuid()}@workspace.local";
            var fullName = !string.IsNullOrWhiteSpace(request.FullName) ? request.FullName.Trim() : email.Split('@')[0];
            var nameParts = fullName.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
            var firstName = nameParts.Length > 0 ? nameParts[0] : "Member";
            var lastName = nameParts.Length > 1 ? nameParts[1] : "User";

            // Guard against duplicate ExternalIdentityId conflict before creating
            string? externalIdToSet = null;
            if (!string.IsNullOrWhiteSpace(request.ExternalIdentityId))
            {
                var externalIdTaken = await dbContext.Users!
                    .AnyAsync(u => u.ExternalIdentityId == request.ExternalIdentityId, cancellationToken);
                if (!externalIdTaken)
                {
                    externalIdToSet = request.ExternalIdentityId;
                }
            }

            user = new User
            {
                Id = request.UserId.HasValue && request.UserId.Value != Guid.Empty ? request.UserId.Value : Guid.NewGuid(),
                ExternalIdentityId = externalIdToSet,
                Username = email,
                Email = email,
                FirstName = firstName,
                LastName = lastName,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = !string.IsNullOrWhiteSpace(performedBy) ? performedBy : "System"
            };

            await dbContext.Users!.AddAsync(user, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);

            logger.LogInformation("Auto-provisioned new operational user {UserId} ({Email}) by {PerformedBy}", user.Id, user.Email, performedBy);
        }

        return user;
    }

    public async Task<(bool Success, string? ErrorMessage)> AssignUserRolesAsync(
        AssignUserRolesDto request,
        string performedBy,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await GetOrProvisionUserAsync(request, performedBy, cancellationToken);
            if (user == null)
            {
                return (false, "User not found and insufficient details (Email/Name) provided to provision user profile.");
            }

            // If user exists but lacks ExternalIdentityId, bind it safely for permission lookup
            if (!string.IsNullOrWhiteSpace(request.ExternalIdentityId) && string.IsNullOrWhiteSpace(user.ExternalIdentityId))
            {
                var externalIdTaken = await dbContext.Users!
                    .AnyAsync(u => u.Id != user.Id && u.ExternalIdentityId == request.ExternalIdentityId, cancellationToken);
                if (!externalIdTaken)
                {
                    user.ExternalIdentityId = request.ExternalIdentityId;
                    user.UpdatedAt = DateTime.UtcNow;
                    user.UpdatedBy = !string.IsNullOrWhiteSpace(performedBy) ? performedBy : "System";
                }
            }

            // Direct query of existing user role assignments from DB (ignoring soft-delete query filter)
            var existingAssignments = await dbContext.UserRoleAssignments!
                .IgnoreQueryFilters()
                .Where(ra => ra.UserId == user.Id)
                .ToListAsync(cancellationToken);

            var existingRoleMap = existingAssignments.ToDictionary(ra => ra.RoleId, ra => ra);
            var desiredRoleIds = (request.RoleIds ?? [])
                .Where(id => id != Guid.Empty)
                .Distinct()
                .ToHashSet();

            // 1. Roles to remove: existing active in DB, but not in desiredRoleIds
            var toRemove = existingAssignments
                .Where(ra => !ra.IsDeleted && !desiredRoleIds.Contains(ra.RoleId))
                .ToList();

            if (toRemove.Count > 0)
            {
                dbContext.UserRoleAssignments!.RemoveRange(toRemove);
            }

            // 2. Roles to keep or restore if soft-deleted
            foreach (var ra in existingAssignments.Where(ra => desiredRoleIds.Contains(ra.RoleId)))
            {
                if (ra.IsDeleted)
                {
                    ra.IsDeleted = false;
                    ra.DeletedAt = null;
                    ra.DeletedBy = null;
                    ra.UpdatedAt = DateTime.UtcNow;
                    ra.UpdatedBy = !string.IsNullOrWhiteSpace(performedBy) ? performedBy : "System";
                }
            }

            // 3. Roles to add: in desiredRoleIds, but not in existingRoleMap (neither active nor soft-deleted)
            var toAddIds = desiredRoleIds
                .Where(id => !existingRoleMap.ContainsKey(id))
                .ToList();

            if (toAddIds.Count > 0)
            {
                var validRoleIds = await dbContext.AmsRoles!
                    .Where(r => toAddIds.Contains(r.Id) && !r.IsDeleted && r.IsActive)
                    .Select(r => r.Id)
                    .ToListAsync(cancellationToken);

                foreach (var roleId in validRoleIds)
                {
                    await dbContext.UserRoleAssignments!.AddAsync(new UserRoleAssignment
                    {
                        Id = Guid.NewGuid(),
                        UserId = user.Id,
                        RoleId = roleId,
                        AssignedAt = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = !string.IsNullOrWhiteSpace(performedBy) ? performedBy : "System"
                    }, cancellationToken);
                }
            }

            await dbContext.SaveChangesAsync(cancellationToken);

            // Invalidate cache by both external identity ID and email
            if (!string.IsNullOrWhiteSpace(user.ExternalIdentityId))
            {
                authorizationService.InvalidateUserPermissions(user.ExternalIdentityId, null);
            }
            if (!string.IsNullOrWhiteSpace(request.ExternalIdentityId) && request.ExternalIdentityId != user.ExternalIdentityId)
            {
                authorizationService.InvalidateUserPermissions(request.ExternalIdentityId, null);
            }
            if (!string.IsNullOrWhiteSpace(user.Email))
            {
                authorizationService.InvalidateUserPermissions(user.Email, null);
            }

            return (true, null);
        }
        catch (Exception ex)
        {
            var detailedError = ex.InnerException != null ? $"{ex.Message} --> {ex.InnerException.Message}" : ex.Message;
            logger.LogError(ex, "Failed to assign operational roles to user {UserId} / {Email}: {Message}", request.UserId, request.Email, detailedError);
            return (false, detailedError);
        }
    }
}
