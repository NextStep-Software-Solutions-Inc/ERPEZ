using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Enums;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Commands.CreateTenantSubscription;

public sealed class CreateTenantSubscriptionCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateTenantSubscriptionCommand, ApiResponse<TenantSubscription>>
{
    public async Task<ApiResponse<TenantSubscription>> Handle(CreateTenantSubscriptionCommand command, CancellationToken cancellationToken)
    {
        var existTenant = await _unitOfWork.TenantRepository.GetByIdAsync(command.TenantId, cancellationToken: cancellationToken) ?? throw new NotFoundException("Tenant does not exist.");
        var existTenantSubscription = await _unitOfWork.TenantSubscriptionRepository.FindAsync(ts =>
            ts.TenantId == command.TenantId &&
            ts.StartDate == command.StartDate &&
            ts.EndDate == command.EndDate && !ts.IsDeleted, cancellationToken);

        if(existTenantSubscription != null)
        {
            throw new ConflictException("Tenant subscription already exist.");
        }
        var validation = EnumValidator.ValidateAll(
            (typeof(TenantSubscriptionPlanEnum), command.Plan, nameof(command.Plan)),
            (typeof(TenantSubscriptionBillingCycleEnum), command.BillingCycle, nameof(command.BillingCycle)),
            (typeof(TenantSubscriptionStatusEnum), command.Status, nameof(command.Status))
        );

        if (!validation.IsValid)
        {
            return new()
            {
                Succeeded = false,
                Message = validation.ErrorMessage
            };
        }

        var plan = Enum.Parse<TenantSubscriptionPlanEnum>(command.Plan);
        var billingCycle = Enum.Parse<TenantSubscriptionBillingCycleEnum>(command.BillingCycle);
        var status = Enum.Parse<TenantSubscriptionStatusEnum>(command.Status);

        var tenantSubscription = new TenantSubscription
        {
            TenantId = command.TenantId,
            Amount = command.Amount,
            Plan = (int)plan ,
            StartDate = command.StartDate,
            EndDate = command.EndDate,
            BillingCycle = (int)billingCycle,
            Status = (int)status,
            AutoRenew = command.AutoRenew
        };

        await _unitOfWork.TenantSubscriptionRepository.AddAsync(tenantSubscription, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<TenantSubscription>.Success(tenantSubscription, "Tenant subscription created successfully.");
    }
}
