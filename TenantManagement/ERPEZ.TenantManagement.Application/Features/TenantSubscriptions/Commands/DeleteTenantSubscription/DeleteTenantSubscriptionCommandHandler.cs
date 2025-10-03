using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Commands.DeleteTenantSubscription;

public sealed class DeleteTenantSubscriptionCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteTenantSubscriptionCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteTenantSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var tenantSubscription = await unitOfWork.TenantSubscriptionRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken);

        if (tenantSubscription == null) return ApiResponse<Unit>.Fail("Tenant subscription not found.");

        unitOfWork.TenantSubscriptionRepository.Remove(tenantSubscription);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Tenant subscription deleted successfully.");
    }
}
