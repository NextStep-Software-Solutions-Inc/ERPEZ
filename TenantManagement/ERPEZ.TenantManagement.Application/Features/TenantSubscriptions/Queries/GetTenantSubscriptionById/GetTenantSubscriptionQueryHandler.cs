using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Dtos;
using ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Queries.GetTenantSubscriptionById;

public sealed class GetTenantSubscriptionQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetTenantSubscriptionByIdQuery, ApiResponse<TenantSubscriptionDto>>
{
    public async Task<ApiResponse<TenantSubscriptionDto>> Handle(
        GetTenantSubscriptionByIdQuery request,
        CancellationToken cancellationToken)
    {
        var tenantSubscription = await unitOfWork.TenantSubscriptionRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Tenant subscription not found.");

        var dto = new TenantSubscriptionDto
        {
            Id = tenantSubscription.Id,
            TenantId = tenantSubscription.TenantId,
            Amount = tenantSubscription.Amount,
            Plan = ((TenantSubscriptionPlanEnum)tenantSubscription.Plan).ToString(),
            Status = ((TenantSubscriptionStatusEnum)tenantSubscription.Status).ToString(),
            BillingCycle = ((TenantSubscriptionBillingCycleEnum)tenantSubscription.BillingCycle).ToString(),
            StartDate = tenantSubscription.StartDate,
            EndDate = tenantSubscription.EndDate,
            AutoRenew = tenantSubscription.AutoRenew
        };
        return ApiResponse<TenantSubscriptionDto>.Success(dto, "Tenant subscription retrieved successfully.");
    }
}
