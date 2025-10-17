using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.Tenants.Dtos;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Queries.GetTenantsByMe;

public record class GetTenantByMeQuery(string UserId) : IRequest<ApiResponse<IReadOnlyList<TenantDto>>>;
