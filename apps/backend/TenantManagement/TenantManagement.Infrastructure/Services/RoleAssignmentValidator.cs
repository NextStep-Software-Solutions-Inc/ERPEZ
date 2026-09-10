using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Infrastructure.Services;

/// <summary>
/// Pure authorization and business validator for tenant role assignments and member modifications.
/// </summary>
public class RoleAssignmentValidator(
    ApplicationDbContext dbContext,
    IUserAuthorizationService authService) : IRoleAssignmentValidator
{
    public async Task ValidateRoleAssignmentsAsync(
        Guid tenantId,
        string actorExternalIdentityId,
        Guid? targetMemberId,
        IEnumerable<Guid> requestedRoleIds,
        CancellationToken cancellationToken = default)
    {
        var roleIdList = requestedRoleIds.Distinct().ToList();
        if (roleIdList.Count == 0) return;

        // 1. Load roles and verify existence
        var roles = await dbContext.Roles!
            .Include(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .Where(r => roleIdList.Contains(r.Id))
            .ToListAsync(cancellationToken);

        if (roles.Count != roleIdList.Count)
        {
            throw new ValidationException("One or more specified roles do not exist.");
        }

        // 2. Enforce universal assignability predicate on each role
        foreach (var r in roles)
        {
            if (r.IsDeleted)
            {
                throw new ValidationException($"Role '{r.Name}' is deleted and cannot be assigned.");
            }

            if (!r.IsAssignableToTenant)
            {
                throw new ValidationException($"Role '{r.Name}' is not assignable to tenant members.");
            }

            if (r.TenantId.HasValue && r.TenantId.Value != tenantId)
            {
                throw new ForbiddenException($"Cross-tenant role assignment forbidden for role '{r.Name}'.");
            }
        }

        // 3. Determine if actor is an active Tenant Administrator in THIS tenant
        var isTenantAdmin = await dbContext.TenantMembers!
            .AnyAsync(tm => tm.TenantId == tenantId &&
                            tm.ExternalIdentityId == actorExternalIdentityId &&
                            tm.Status == Status.Active &&
                            !tm.IsDeleted &&
                            tm.RoleAssignments.Any(ra => ra.Role.NormalizedName == "TENANT ADMINISTRATOR"),
                      cancellationToken);

        // 4. If not Tenant Administrator, enforce explicit membersManage check and permission delegation boundaries
        if (!isTenantAdmin)
        {
            var actorPermissions = await authService.GetPermissionsAsync(actorExternalIdentityId, tenantId, cancellationToken);

            if (!actorPermissions.Contains(Permissions.Admin.membersManage))
            {
                throw new ForbiddenException("You do not have permission to manage tenant members.");
            }

            var requiredPermissions = roles
                .SelectMany(r => r.RolePermissions)
                .Select(rp => rp.Permission.Key)
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            var missing = requiredPermissions
                .Except(actorPermissions, StringComparer.OrdinalIgnoreCase)
                .FirstOrDefault();

            if (missing != null)
            {
                throw new ForbiddenException($"Privilege escalation denied: actor lacks permission '{missing}'.");
            }
        }

        // 5. Self-lockout check on roles
        if (targetMemberId.HasValue)
        {
            var targetMember = await dbContext.TenantMembers!
                .Include(tm => tm.RoleAssignments).ThenInclude(ra => ra.Role)
                .FirstOrDefaultAsync(tm => tm.Id == targetMemberId.Value && tm.TenantId == tenantId, cancellationToken);

            if (targetMember != null && string.Equals(targetMember.ExternalIdentityId, actorExternalIdentityId, StringComparison.OrdinalIgnoreCase))
            {
                var hadAdmin = targetMember.RoleAssignments.Any(ra => ra.Role.NormalizedName == "TENANT ADMINISTRATOR");
                var willRetainAdmin = roles.Any(r => r.NormalizedName == "TENANT ADMINISTRATOR");

                if (hadAdmin && !willRetainAdmin)
                {
                    throw new ValidationException("Cannot remove Tenant Administrator role from yourself.");
                }
            }
        }
    }

    public void ValidateSelfLockout(
        string actorExternalIdentityId,
        string targetExternalIdentityId,
        Status newStatus,
        bool hadAdminRole,
        bool willRetainAdminRole)
    {
        if (string.IsNullOrWhiteSpace(actorExternalIdentityId) || string.IsNullOrWhiteSpace(targetExternalIdentityId))
        {
            return;
        }

        if (string.Equals(actorExternalIdentityId, targetExternalIdentityId, StringComparison.OrdinalIgnoreCase))
        {
            if (newStatus == Status.Disabled || newStatus == Status.Inactive || newStatus == Status.Suspended)
            {
                throw new ValidationException("You cannot deactivate or suspend your own tenant membership.");
            }

            if (hadAdminRole && !willRetainAdminRole)
            {
                throw new ValidationException("Cannot remove Tenant Administrator role from yourself.");
            }
        }
    }
}
