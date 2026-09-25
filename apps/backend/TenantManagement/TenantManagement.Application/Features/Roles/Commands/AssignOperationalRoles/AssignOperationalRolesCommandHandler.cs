using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Application.Features.Roles.Commands.AssignOperationalRoles;

public class AssignOperationalRolesCommandHandler(
    IUnitOfWork unitOfWork,
    ITenantContextService tenantContext,
    ICurrentUserService currentUser,
    IRoleAssignmentValidator roleAssignmentValidator,
    IUserAuthorizationService authService,
    ITenantAuditService auditService)
    : IRequestHandler<AssignOperationalRolesCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        AssignOperationalRolesCommand command,
        CancellationToken cancellationToken)
    {
        if (!tenantContext.TenantId.HasValue)
        {
            throw new UnauthorizedException("Tenant context is missing or unauthenticated.");
        }

        var tenantId = tenantContext.TenantId.Value;
        var actorExternalId = currentUser.ExternalIdentityId ?? currentUser.UserId;
        var actorEmail = currentUser.Email ?? string.Empty;

        if (string.IsNullOrWhiteSpace(actorExternalId))
        {
            throw new UnauthorizedException("Current user identity is unauthenticated.");
        }

        // 1. Load target tenant member ensuring tenant boundary isolation
        var targetMember = await unitOfWork.TenantMemberRepository.Query()
            .Include(m => m.RoleAssignments).ThenInclude(ra => ra.Role)
            .FirstOrDefaultAsync(m => m.Id == command.TargetTenantMemberId && m.TenantId == tenantId && !m.IsDeleted, cancellationToken)
            ?? throw new NotFoundException($"Target tenant member '{command.TargetTenantMemberId}' was not found in the active tenant workspace.");

        var candidateRoleIds = command.RoleIds.Distinct().ToList();

        // 2. Authoritative role assignment validation for Operational scope
        await roleAssignmentValidator.ValidateRoleAssignmentsAsync(
            tenantId,
            actorExternalId,
            targetMemberId: targetMember.Id,
            candidateRoleIds,
            expectedScope: RoleScope.Operational,
            cancellationToken: cancellationToken);

        // 3. Mutate assignments: preserve non-operational roles, replace operational roles
        var beforeRoles = targetMember.RoleAssignments.Select(ra => ra.Role.Name).ToList();

        var preservedNonOperationalAssignments = targetMember.RoleAssignments
            .Where(ra => ra.Role.Scope != RoleScope.Operational)
            .Select(ra => ra.RoleId)
            .ToList();

        targetMember.RoleAssignments.Clear();

        foreach (var roleId in preservedNonOperationalAssignments)
        {
            targetMember.RoleAssignments.Add(new TenantMemberRoleAssignment
            {
                TenantMemberId = targetMember.Id,
                RoleId = roleId
            });
        }

        foreach (var roleId in candidateRoleIds)
        {
            targetMember.RoleAssignments.Add(new TenantMemberRoleAssignment
            {
                TenantMemberId = targetMember.Id,
                RoleId = roleId
            });
        }

        targetMember.ConcurrencyStamp = Guid.NewGuid();
        targetMember.UpdatedAt = DateTime.UtcNow;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        // 4. Invalidate cached permissions for target user
        var targetExternalId = targetMember.ExternalIdentityId;
        if (!string.IsNullOrWhiteSpace(targetExternalId))
        {
            authService.InvalidateUserPermissions(targetExternalId, tenantId);
        }
        if (!string.IsNullOrWhiteSpace(targetMember.UserId) && targetMember.UserId != targetExternalId)
        {
            authService.InvalidateUserPermissions(targetMember.UserId, tenantId);
        }

        // 5. Emit audit log
        var afterRoles = await unitOfWork.RoleRepository.Query()
            .Where(r => candidateRoleIds.Contains(r.Id))
            .Select(r => r.Name)
            .ToListAsync(cancellationToken);

        await auditService.LogMemberEventAsync(
            tenantId,
            actorExternalId,
            actorEmail,
            targetMember.Id,
            targetMember.Email,
            "OPERATIONAL_ROLES_ASSIGNED",
            new { Roles = beforeRoles },
            new { OperationalRoles = afterRoles },
            cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Operational roles assigned successfully.");
    }
}
