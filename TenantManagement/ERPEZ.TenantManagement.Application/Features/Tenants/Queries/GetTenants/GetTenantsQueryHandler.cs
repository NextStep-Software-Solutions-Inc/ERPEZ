using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Sieve.Models;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Queries.GetTenants;

public sealed class GetTenantsQueryHandler (IUnitOfWork unitOfWork) : IRequestHandler<GetTenantsQuery, PaginatedApiResponse<Tenant>>
{
    public async Task<PaginatedApiResponse<Tenant>> Handle(GetTenantsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        var (tenants, totalCount) = await unitOfWork.TenantRepository.GetAllAsync(sieveModel, isDeleted: false, cancellationToken: cancellationToken);

        return new PaginatedApiResponse<Tenant>(
            [.. tenants],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
