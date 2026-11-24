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

namespace ERPEZ.TenantManagement.Application.Features.Roles.Commands.CreateTenantRole;

public class CreateTenantRoleCommandHandler(
    IUnitOfWork unitOfWork,
    ITenantContextService tenantContext,
    ICurrentUserService currentUser,
    IUserAuthorizationService authService,
    ITenantAuditService auditService)
    : IRequestHandler<CreateTenantRoleCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateTenantRoleCommand command, CancellationToken cancellationToken)
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

        // 1. Check if actor is an active Tenant Administrator in THIS tenant
        var isTenantAdmin = await unitOfWork.TenantMemberRepository.Query()
            .AnyAsync(tm => tm.TenantId == tenantId &&
                            (tm.ExternalIdentityId == actorExternalId || tm.UserId == actorExternalId) &&
                            tm.Status == Status.Active &&
                            !tm.IsDeleted &&
                            tm.RoleAssignments.Any(ra => ra.Role.NormalizedName == "TENANT ADMINISTRATOR"),
                      cancellationToken);

        // 2. Privilege delegation verification
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
            .AnyAsync(r => r.TenantId == tenantId && r.NormalizedName == normalizedName && !r.IsDeleted, cancellationToken);

        if (nameConflict)
        {
            throw new ConflictException($"A role named '{command.Name}' already exists in this tenant.");
        }

        var invalidKeys = command.PermissionKeys
            .Where(k => !TenantPermissions.all.Contains(k))
            .ToList();
        if (invalidKeys.Count > 0)
        {
            throw new ValidationException($"Invalid tenant permission keys: {string.Join(", ", invalidKeys)}");
        }

        var role = new Role
        {
            Name = command.Name.Trim(),
            NormalizedName = normalizedName,
            Description = command.Description,
            IsSystemRole = false,
            Scope = RoleScope.Tenant,
            IsAssignableToTenant = true,
            TenantId = tenantId,
            Permissions = command.PermissionKeys.Distinct().ToList()
        };

        await unitOfWork.RoleRepository.AddAsync(role, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        await auditService.LogRoleEventAsync(
            tenantId,
            actorExternalId,
            actorEmail,
            role.Id,
            role.Name,
            "ROLE_CREATED",
            null,
            new { role.Name, Permissions = command.PermissionKeys },
            cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(role.Id, "Tenant role created successfully.");
    }
}
