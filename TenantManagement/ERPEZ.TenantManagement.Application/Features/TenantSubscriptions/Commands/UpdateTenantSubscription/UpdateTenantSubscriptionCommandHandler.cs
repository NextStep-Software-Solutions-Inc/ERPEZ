using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
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
            .FindAsync(ts => ts.Id == request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Tenant subscription not found.");
        if (dto.TenantId.HasValue)
        {
            var existTenant = await unitOfWork.TenantRepository.GetByIdAsync(dto.TenantId.Value, cancellationToken: cancellationToken) ?? throw new NotFoundException("Tenant not found.");
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
        tenantSubscription.Amount = dto.Amount ?? tenantSubscription.Amount;
        tenantSubscription.StartDate = dto.StartDate ?? tenantSubscription.StartDate;
        tenantSubscription.EndDate = dto.EndDate ?? tenantSubscription.EndDate;
        tenantSubscription.AutoRenew = dto.AutoRenew ?? tenantSubscription.AutoRenew;

        if (!string.IsNullOrWhiteSpace(dto.Plan))
            tenantSubscription.Plan = (int)Enum.Parse<TenantSubscriptionPlanEnum>(dto.Plan);

        if (!string.IsNullOrWhiteSpace(dto.Status))
            tenantSubscription.Status = (int)Enum.Parse<TenantSubscriptionStatusEnum>(dto.Status);

        if (!string.IsNullOrWhiteSpace(dto.BillingCycle))
            tenantSubscription.BillingCycle = (int)Enum.Parse<TenantSubscriptionBillingCycleEnum>(dto.BillingCycle);

        unitOfWork.TenantSubscriptionRepository.Update(tenantSubscription);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<TenantSubscription>.Success(tenantSubscription, "Tenant subscription updated successfully.");
    }
}
