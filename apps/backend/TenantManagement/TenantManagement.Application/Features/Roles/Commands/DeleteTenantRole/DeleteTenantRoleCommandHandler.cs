using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Domain.Constants;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Application.Features.Roles.Commands.DeleteTenantRole;

public class DeleteTenantRoleCommandHandler(
    IUnitOfWork unitOfWork,
    ITenantContextService tenantContext,
    ICurrentUserService currentUser,
    IUserAuthorizationService authService,
    ITenantAuditService auditService)
    : IRequestHandler<DeleteTenantRoleCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(DeleteTenantRoleCommand command, CancellationToken cancellationToken)
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

        var role = await unitOfWork.RoleRepository.Query()
            .FirstOrDefaultAsync(r => r.Id == command.Id, cancellationToken)
            ?? throw new NotFoundException("Role not found.");

        if (role.IsSystemRole || !role.TenantId.HasValue)
        {
            throw new ForbiddenException("System roles are immutable and cannot be deleted.");
        }

        if (role.TenantId.Value != tenantId)
        {
            throw new ForbiddenException("Role does not belong to the current tenant.");
        }

        if (role.IsDeleted)
        {
            return ApiResponse<bool>.Success(true, "Role is already deleted.");
        }

        var isTenantAdmin = await unitOfWork.TenantMemberRepository.Query()
            .AnyAsync(tm => tm.TenantId == tenantId &&
                            (tm.ExternalIdentityId == actorExternalId || tm.UserId == actorExternalId) &&
                            tm.Status == Status.Active &&
                            !tm.IsDeleted &&
                            tm.RoleAssignments.Any(ra => ra.Role.NormalizedName == "TENANT ADMINISTRATOR"),
                      cancellationToken);

        if (!isTenantAdmin)
        {
            var actorPermissions = await authService.GetPermissionsAsync(actorExternalId, tenantId, cancellationToken);
            if (!actorPermissions.Contains(TenantPermissions.rolesManage) &&
                !actorPermissions.Contains(Permissions.Admin.rolesManage))
            {
                throw new ForbiddenException("You do not have permission to manage tenant roles.");
            }
        }

        role.IsDeleted = true;
        role.DeletedAt = DateTime.UtcNow;
        role.DeletedBy = actorExternalId;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        await auditService.LogRoleEventAsync(
            tenantId,
            actorExternalId,
            actorEmail,
            role.Id,
            role.Name,
            "ROLE_DELETED",
            new { role.Name },
            null,
            cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "Tenant role deleted successfully.");
    }
}
