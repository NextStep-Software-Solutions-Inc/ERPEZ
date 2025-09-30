using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Commands.CreateTenantSubscription;

public sealed class CreateTenantSubscriptionCommandHandler : IRequestHandler<CreateTenantSubscriptionCommand, ApiResponse<TenantSubscription>>
{
    private readonly ITenantSubscriptionRepository _tenantSubscriptionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateTenantSubscriptionCommandHandler(ITenantSubscriptionRepository tenantSubscriptionRepository, IUnitOfWork unitOfWork)
    {
        _tenantSubscriptionRepository = tenantSubscriptionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<TenantSubscription>> Handle(CreateTenantSubscriptionCommand command, CancellationToken cancellationToken)
    {
        var existTenant = await _unitOfWork.TenantRepository.GetByIdAsync(command.TenantId, cancellationToken: cancellationToken);
        if (existTenant == null)
        {
            return new()
            {
                Succeeded = false,
                Message = "Tenant does not exist."
            };
        }
        var existTenantSubscription = await _unitOfWork.TenantSubscriptionRepository.FindAsync(ts =>
        ts.TenantId == command.TenantId &&
        ts.StartDate == command.StartDate &&
        ts.EndDate == command.EndDate && !ts.IsDeleted);

        if(existTenantSubscription != null)
        {
            return new()
            {
               Succeeded = false,
               Message = "Tenant subscription already exist."
            };
        }

        var tenantSubscription = new TenantSubscription
        {
            TenantId = command.TenantId,
            Amount = command.Amount,
            Plan = command.Plan,
            StartDate = command.StartDate,
            EndDate = command.EndDate,
            BillingCycle = command.BillingCycle,
            Status = command.Status,
            AutoRenew = command.AutoRenew
        };

        await _tenantSubscriptionRepository.AddAsync(tenantSubscription);
        await _unitOfWork.SaveChangesAsync();
        return new()
        {
            Succeeded = true,
            Message = "Tenant subscription created successfully."
        };
    }
}
