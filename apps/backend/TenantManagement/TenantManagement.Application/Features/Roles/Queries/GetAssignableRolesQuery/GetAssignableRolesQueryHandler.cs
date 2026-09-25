using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Application.Features.Roles.Dtos;
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
            .Include(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .Where(predicate)
            .OrderBy(r => r.IsSystemRole ? 0 : 1)
            .ThenBy(r => r.Name)
            .Select(r => new RoleSummaryDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                IsSystemRole = r.IsSystemRole,
                Scope = r.Scope,
                IsAssignableToTenant = r.IsAssignableToTenant,
                TenantId = r.TenantId,
                PermissionKeys = r.RolePermissions.Select(rp => rp.Permission.Key).ToList(),
                PermissionDisplayNames = r.RolePermissions.Select(rp => rp.Permission.DisplayName).ToList()
            })
            .ToListAsync(cancellationToken);

        return ApiResponse<IReadOnlyList<RoleSummaryDto>>.Success(roles, "Assignable roles retrieved successfully.");
    }
}
