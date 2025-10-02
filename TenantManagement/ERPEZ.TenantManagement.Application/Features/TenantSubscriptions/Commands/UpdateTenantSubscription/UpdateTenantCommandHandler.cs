using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Enums;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Commands.UpdateTenantSubscription;

public class UpdateTenantSubscriptionCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateTenantSubscriptionCommand, ApiResponse<TenantSubscription>>
{
    public async Task<ApiResponse<TenantSubscription>> Handle(UpdateTenantSubscriptionCommand request, CancellationToken cancellationToken)
    {
        if (request?.UpdateTenantSubscription == null)
        {
            return ApiResponse<TenantSubscription>.Fail("Invalid request. UpdateTenantSubscription cannot be null.");
        }

        var dto = request.UpdateTenantSubscription;

        var tenantSubscription = await unitOfWork.TenantSubscriptionRepository
            .FindAsync(ts => ts.Id == request.Id, cancellationToken: cancellationToken);

        if (tenantSubscription == null)
        {
            return ApiResponse<TenantSubscription>.Fail("Tenant subscription not found.");
        }

        if (dto.TenantId.HasValue)
        {
            var existTenant = await unitOfWork.TenantRepository.GetByIdAsync(dto.TenantId.Value, cancellationToken: cancellationToken);
            if (existTenant == null)
            {
                return ApiResponse<TenantSubscription>.Fail("Tenant does not exist.");
            }
            tenantSubscription.TenantId = dto.TenantId.Value;
        }

        var validation = EnumValidator.ValidateAll(
            (typeof(TenantSubscriptionPlanEnum), dto.Plan, nameof(dto.Plan)),
            (typeof(TenantSubscriptionBillingCycleEnum), dto.BillingCycle, nameof(dto.BillingCycle)),
            (typeof(TenantSubscriptionStatusEnum), dto.Status, nameof(dto.Status))
        );

        if (!validation.IsValid)
        {
            return new()
            {
                Succeeded = false,
                Message = validation.ErrorMessage
            };
        }
        if (dto.Amount.HasValue)
            tenantSubscription.Amount = dto.Amount.Value;

        if (!string.IsNullOrWhiteSpace(dto.Plan))
            tenantSubscription.Plan = (int)Enum.Parse<TenantSubscriptionPlanEnum>(dto.Plan);

        if (dto.StartDate.HasValue)
            tenantSubscription.StartDate = dto.StartDate.Value;

        if (dto.EndDate.HasValue)
            tenantSubscription.EndDate = dto.EndDate.Value;

        if (!string.IsNullOrWhiteSpace(dto.Status))
            tenantSubscription.Status = (int)Enum.Parse<TenantSubscriptionStatusEnum>(dto.Status);

        if (!string.IsNullOrWhiteSpace(dto.BillingCycle))
            tenantSubscription.BillingCycle = (int)Enum.Parse<TenantSubscriptionBillingCycleEnum>(dto.BillingCycle);

        if (dto.AutoRenew.HasValue)
            tenantSubscription.AutoRenew = dto.AutoRenew.Value;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new ApiResponse<TenantSubscription>
        {
            Succeeded = true,
            Message = "Tenant subscription updated successfully.",
            Data = tenantSubscription
        };
    }
}
