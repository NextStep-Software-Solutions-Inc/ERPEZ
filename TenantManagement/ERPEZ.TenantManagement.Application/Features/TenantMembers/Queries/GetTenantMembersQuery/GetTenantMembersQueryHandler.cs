using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Sieve.Models;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Queries.GetTenantMembersQuery;

public class GetTenantMembersQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetTenantMembersQuery, PaginatedApiResponse<TenantMember>>
{
    public async Task<PaginatedApiResponse<TenantMember>> Handle(GetTenantMembersQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (tenantMembers, totalCount) = await unitOfWork.TenantMemberRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);

        return new PaginatedApiResponse<TenantMember>(
            [.. tenantMembers],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
