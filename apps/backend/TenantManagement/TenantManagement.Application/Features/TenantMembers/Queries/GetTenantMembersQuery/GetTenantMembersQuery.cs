using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.TenantMembers.Dtos;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Queries.GetTenantMembersQuery;

public class GetTenantMembersQuery : IRequest<PaginatedApiResponse<TenantMemberDto>>
{
    public Guid? TenantId { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Filters { get; set; }
    public string? Sorts { get; set; }
}
