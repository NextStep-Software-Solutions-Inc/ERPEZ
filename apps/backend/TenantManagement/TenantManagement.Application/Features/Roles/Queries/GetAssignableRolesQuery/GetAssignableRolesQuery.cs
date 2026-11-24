using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.Roles.Dtos;
using ERPEZ.TenantManagement.Domain.Enums;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Roles.Queries.GetAssignableRolesQuery;

/// <summary>
/// Query to retrieve assignable roles for the current tenant context, optionally filtered by RoleScope.
/// Takes NO client-supplied tenantId to prevent cross-tenant parameter spoofing.
/// </summary>
public record GetAssignableRolesQuery(RoleScope? Scope = null) : IRequest<ApiResponse<IReadOnlyList<RoleSummaryDto>>>;
