using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Application.Features.Roles.Dtos;
using ERPEZ.TenantManagement.Domain.Constants;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Application.Features.Roles.Queries.GetAssignableRolesQuery;

public class GetAssignableRolesQueryHandler(
    IUnitOfWork unitOfWork,
    ITenantContextService tenantContext)
    : IRequestHandler<GetAssignableRolesQuery, ApiResponse<IReadOnlyList<RoleSummaryDto>>>
{
    public async Task<ApiResponse<IReadOnlyList<RoleSummaryDto>>> Handle(
        GetAssignableRolesQuery request,
        CancellationToken cancellationToken)
    {
        if (!tenantContext.TenantId.HasValue)
        {
            throw new UnauthorizedException("Tenant context is missing or unauthenticated.");
        }

        var tenantId = tenantContext.TenantId.Value;

        // Invariant: r.IsAssignableToTenant && !r.IsDeleted && (!scope.HasValue || r.Scope == scope.Value) && (!r.TenantId.HasValue || r.TenantId.Value == tenantId)
        var predicate = Role.IsAssignableToTenantPredicate(tenantId, request.Scope);

        var roles = await unitOfWork.RoleRepository.Query()
            .AsNoTracking()
            .Where(predicate)
            .OrderBy(r => r.IsSystemRole ? 0 : 1)
            .ThenBy(r => r.Name)
            .ToListAsync(cancellationToken);

        var dtos = roles.Select(r =>
        {
            var perms = r.IsSystemRole
                ? TenantManagementPermissionsRegistry.GetPermissionsForRole(r.Name).ToList()
                : (r.Permissions ?? []);

            return new RoleSummaryDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                IsSystemRole = r.IsSystemRole,
                Scope = r.Scope,
                IsAssignableToTenant = r.IsAssignableToTenant,
                TenantId = r.TenantId,
                PermissionKeys = perms,
                PermissionDisplayNames = perms
            };
        }).ToList();

        return ApiResponse<IReadOnlyList<RoleSummaryDto>>.Success(dtos, "Assignable roles retrieved successfully.");
    }
}
