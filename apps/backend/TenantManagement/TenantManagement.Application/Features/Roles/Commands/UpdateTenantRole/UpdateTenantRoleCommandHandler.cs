using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Domain.Constants;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Application.Features.Roles.Commands.UpdateTenantRole;

public class UpdateTenantRoleCommandHandler(
    IUnitOfWork unitOfWork,
    ITenantContextService tenantContext,
    ICurrentUserService currentUser,
    IUserAuthorizationService authService,
    ITenantAuditService auditService)
    : IRequestHandler<UpdateTenantRoleCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(UpdateTenantRoleCommand command, CancellationToken cancellationToken)
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
            throw new ForbiddenException("System roles are immutable and cannot be modified.");
        }

        if (role.TenantId.Value != tenantId)
        {
            throw new ForbiddenException("Role does not belong to the current tenant.");
        }

        if (role.IsDeleted)
        {
            throw new ValidationException("Cannot modify a deleted role.");
        }

        var isTenantAdmin = await unitOfWork.TenantMemberRepository.Query()
            .AnyAsync(tm => tm.TenantId == tenantId &&
                            (tm.ExternalIdentityId == actorExternalId || tm.UserId == actorExternalId) &&
                            tm.Status == Status.Active &&
                            !tm.IsDeleted &&
                            tm.RoleAssignments.Any(ra => ra.Role.NormalizedName == "TENANT ADMINISTRATOR"),
                      cancellationToken);

        var actorPermissions = await authService.GetPermissionsAsync(actorExternalId, tenantId, cancellationToken);

        if (!isTenantAdmin)
        {
            if (!actorPermissions.Contains(TenantPermissions.rolesManage) &&
                !actorPermissions.Contains(Permissions.Admin.rolesManage))
            {
                throw new ForbiddenException("You do not have permission to manage tenant roles.");
            }

            var missing = command.PermissionKeys
                .Except(actorPermissions, StringComparer.OrdinalIgnoreCase)
                .FirstOrDefault();

            if (missing != null)
            {
                throw new ForbiddenException($"Privilege escalation denied: you cannot assign permission '{missing}' to a role because you do not possess it.");
            }
        }

        var normalizedName = command.Name.Trim().ToUpperInvariant();
        var nameConflict = await unitOfWork.RoleRepository.Query()
            .AnyAsync(r => r.TenantId == tenantId && r.NormalizedName == normalizedName && r.Id != command.Id && !r.IsDeleted, cancellationToken);

        if (nameConflict)
        {
            throw new ConflictException($"Another role named '{command.Name}' already exists in this tenant.");
        }

        var invalidKeys = command.PermissionKeys
            .Where(k => !TenantPermissions.all.Contains(k))
            .ToList();
        if (invalidKeys.Count > 0)
        {
            throw new ValidationException($"Invalid tenant permission keys: {string.Join(", ", invalidKeys)}");
        }

        var beforeState = new
        {
            role.Name,
            Permissions = role.Permissions ?? []
        };

        role.Name = command.Name.Trim();
        role.NormalizedName = normalizedName;
        role.Description = command.Description;
        role.Permissions = command.PermissionKeys.Distinct().ToList();

        await unitOfWork.SaveChangesAsync(cancellationToken);

        await auditService.LogRoleEventAsync(
            tenantId,
            actorExternalId,
            actorEmail,
            role.Id,
            role.Name,
            "ROLE_MODIFIED",
            beforeState,
            new { role.Name, Permissions = command.PermissionKeys },
            cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(role.Id, "Tenant role updated successfully.");
    }
}
