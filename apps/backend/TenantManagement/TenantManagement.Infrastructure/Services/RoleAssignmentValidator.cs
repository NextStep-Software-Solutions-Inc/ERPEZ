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
        RoleScope expectedScope = RoleScope.TenantManagement,
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

        // 2. Enforce universal assignability, tenancy, and scope predicate on each role
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

            // Cross-tenant boundary: custom roles of another tenant are strictly forbidden
            if (r.TenantId.HasValue && r.TenantId.Value != tenantId)
            {
                throw new ForbiddenException($"Cross-tenant role assignment forbidden for role '{r.Name}'.");
            }

            // Scope Guard: Fails closed on Unknown (0) or mismatched scopes
            if (r.Scope == RoleScope.Unknown || r.Scope != expectedScope)
            {
                throw new ForbiddenException(
                    $"Domain isolation violation: Cannot assign role '{r.Name}' (Scope: {r.Scope}) via an endpoint expecting Scope: {expectedScope}.");
            }
        }

        // 3. Verify actor assignment authority based on expected scope
        var actorPermissions = await authService.GetPermissionsAsync(actorExternalIdentityId, tenantId, cancellationToken);

        switch (expectedScope)
        {
            case RoleScope.TenantManagement:
                if (!actorPermissions.Contains(Permissions.Admin.membersManage))
                {
                    throw new ForbiddenException("You do not have permission to manage tenant governance roles.");
                }
                break;

            case RoleScope.Operational:
                if (!actorPermissions.Contains(Permissions.Admin.operationalRolesManage))
                {
                    throw new ForbiddenException("You do not have permission to manage ERP operational roles.");
                }
                break;

            case RoleScope.ExternalPortal:
                if (!actorPermissions.Contains(Permissions.Procurement.supplierManage))
                {
                    throw new ForbiddenException("You do not have permission to manage supplier portal roles.");
                }
                break;

            default:
                throw new ForbiddenException($"Role scope '{expectedScope}' is not assignable.");
        }

        // 4. Target member boundary and self-lockout check
        if (targetMemberId.HasValue)
        {
            var targetMember = await dbContext.TenantMembers!
                .Include(tm => tm.RoleAssignments).ThenInclude(ra => ra.Role)
                .FirstOrDefaultAsync(tm => tm.Id == targetMemberId.Value && tm.TenantId == tenantId && !tm.IsDeleted, cancellationToken);

            if (targetMember == null)
            {
                throw new ValidationException("Target member does not exist or does not belong to this tenant.");
            }

            if (string.Equals(targetMember.ExternalIdentityId, actorExternalIdentityId, StringComparison.OrdinalIgnoreCase))
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
