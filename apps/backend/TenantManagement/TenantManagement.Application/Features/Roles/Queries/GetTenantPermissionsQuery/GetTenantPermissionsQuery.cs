using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.Roles.Dtos;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Roles.Queries.GetTenantPermissionsQuery;

public record GetTenantPermissionsQuery : IRequest<ApiResponse<IReadOnlyList<PermissionCategoryDto>>>;
