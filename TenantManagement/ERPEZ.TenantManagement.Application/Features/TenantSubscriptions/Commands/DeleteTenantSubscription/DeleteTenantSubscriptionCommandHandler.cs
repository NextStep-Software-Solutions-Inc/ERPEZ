using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Commands.DeleteTenantSubscription;

public sealed class DeleteTenantSubscriptionCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteTenantSubscriptionCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteTenantSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var tenantSubscription = await unitOfWork.TenantSubscriptionRepository.GetByIdAsync(request.Id, isDeleted: false, cancellationToken: cancellationToken);

        if (tenantSubscription == null)
        {
            return new ApiResponse<Unit>()
            {
                Succeeded = false,
                Message = "Tenant subscription not found."
            };
        }

        tenantSubscription.MarkAsDeleted(request.Id);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Tenant subscription deleted successfully.");
    }
}
