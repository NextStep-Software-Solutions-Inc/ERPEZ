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

        // 1. Try finding by UserId if provided
        if (request.UserId.HasValue && request.UserId.Value != Guid.Empty)
        {
            user = await dbContext.Users!
                .Include(u => u.RoleAssignments)
                .FirstOrDefaultAsync(u => u.Id == request.UserId.Value && !u.IsDeleted, cancellationToken);
        }

        // 2. Try finding by ExternalIdentityId if provided
        if (user == null && !string.IsNullOrWhiteSpace(request.ExternalIdentityId))
        {
            user = await dbContext.Users!
                .Include(u => u.RoleAssignments)
                .FirstOrDefaultAsync(u => u.ExternalIdentityId == request.ExternalIdentityId && !u.IsDeleted, cancellationToken);
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

            user = new User
            {
                Id = request.UserId.HasValue && request.UserId.Value != Guid.Empty ? request.UserId.Value : Guid.NewGuid(),
                ExternalIdentityId = request.ExternalIdentityId,
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
        var user = await GetOrProvisionUserAsync(request, performedBy, cancellationToken);
        if (user == null)
        {
            return (false, "User not found and insufficient details (Email/Name) provided to provision user profile.");
        }

        // Remove existing assignments
        if (user.RoleAssignments != null && user.RoleAssignments.Count > 0)
        {
            dbContext.UserRoleAssignments!.RemoveRange(user.RoleAssignments);
        }

        // Add new assignments
        if (request.RoleIds != null && request.RoleIds.Count > 0)
        {
            var validRoleIds = await dbContext.AmsRoles!
                .Where(r => request.RoleIds.Contains(r.Id) && !r.IsDeleted && r.IsActive)
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

        if (!string.IsNullOrWhiteSpace(user.ExternalIdentityId))
        {
            authorizationService.InvalidateUserPermissions(user.ExternalIdentityId, null);
        }

        return (true, null);
    }
}
