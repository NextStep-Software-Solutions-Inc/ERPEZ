using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.Tenants.Dtos;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Queries.GetTenants;

public class GetTenantsQuery : IRequest<PaginatedApiResponse<TenantDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Filters { get; set; }
    public string? Sorts { get; set; }
}
