using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Application.Features.TenantSettings.Queries.GetTenantSettings;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Sieve.Models;

namespace ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Queries.GetTenantSubscriptions;

public sealed class GetTenantSubscriptionsQueryHandler (IUnitOfWork unitOfWork) : IRequestHandler<GetTenantSubscriptionsQuery, PaginatedApiResponse<TenantSubscription>>
{
    public async Task<PaginatedApiResponse<TenantSubscription>> Handle(GetTenantSubscriptionsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (tenantSubscriptions, totalCount) = await unitOfWork.TenantSubscriptionRepository.GetAllAsync(sieveModel, isDeleted: false, cancellationToken: cancellationToken);

        return new PaginatedApiResponse<TenantSubscription>(
            [.. tenantSubscriptions],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
