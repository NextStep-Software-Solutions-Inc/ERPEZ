using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Queries.GetTenantSubscriptionById;

public sealed class GetTenantSubscriptionQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetTenantSubscriptionByIdQuery, TenantSubscription?>
{
    public async Task<TenantSubscription?> Handle(
        GetTenantSubscriptionByIdQuery request,
        CancellationToken cancellationToken)
    {
        var tenantSubscription = await unitOfWork.TenantSubscriptionRepository.GetByIdAsync(
            request.Id,
            isDeleted: false,
            cancellationToken: cancellationToken);

        return tenantSubscription;
    }
}
