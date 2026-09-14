using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.Roles.Dtos;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Roles.Queries.GetAssignableRolesQuery;

/// <summary>
/// Query to retrieve all assignable roles for the current tenant context.
/// Takes NO client-supplied tenantId to prevent cross-tenant parameter spoofing.
/// </summary>
public record GetAssignableRolesQuery : IRequest<ApiResponse<IReadOnlyList<RoleSummaryDto>>>;
