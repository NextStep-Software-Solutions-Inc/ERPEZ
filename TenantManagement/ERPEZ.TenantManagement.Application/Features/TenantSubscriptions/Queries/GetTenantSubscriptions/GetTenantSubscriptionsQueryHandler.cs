using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Dtos;
using ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Enums;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Queries.GetTenantSubscriptions;

public sealed class GetTenantSubscriptionsQueryHandler (IUnitOfWork unitOfWork) : IRequestHandler<GetTenantSubscriptionsQuery, PaginatedApiResponse<TenantSubscriptionDto>>
{
    public async Task<PaginatedApiResponse<TenantSubscriptionDto>> Handle(GetTenantSubscriptionsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<TenantSubscription, TenantSubscriptionDto>> projection = ts => new()
        {
            Id = ts.Id,
            TenantId = ts.TenantId,
            Amount = ts.Amount,
            Plan = ((TenantSubscriptionPlanEnum)ts.Plan).ToString(),
            Status = ((TenantSubscriptionStatusEnum)ts.Status).ToString(),
            BillingCycle = ((TenantSubscriptionBillingCycleEnum)ts.BillingCycle).ToString(),
            StartDate = ts.StartDate,
            EndDate = ts.EndDate,
            AutoRenew = ts.AutoRenew
        };

        var (tenantSubscriptions, totalCount) = await unitOfWork.TenantSubscriptionRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);

        return new PaginatedApiResponse<TenantSubscriptionDto>(
            [..tenantSubscriptions],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
