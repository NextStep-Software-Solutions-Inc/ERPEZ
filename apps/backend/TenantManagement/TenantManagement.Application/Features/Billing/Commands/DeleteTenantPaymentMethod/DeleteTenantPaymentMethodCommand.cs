using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Billing.Commands.DeleteTenantPaymentMethod;

public record DeleteTenantPaymentMethodCommand(Guid Id) : IRequest<ApiResponse<DeletePaymentMethodResponse>>;

public class DeletePaymentMethodResponse
{
    public Guid? PromotedDefaultId { get; set; }
}

public class DeleteTenantPaymentMethodCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteTenantPaymentMethodCommand, ApiResponse<DeletePaymentMethodResponse>>
{
    public async Task<ApiResponse<DeletePaymentMethodResponse>> Handle(
        DeleteTenantPaymentMethodCommand command,
        CancellationToken cancellationToken)
    {
        var query = unitOfWork.TenantPaymentMethodRepository.Query(pm => pm.Id == command.Id && !pm.IsDeleted);
        var targetMethod = await unitOfWork.TenantPaymentMethodRepository.GetFirstAsync(query, cancellationToken);

        if (targetMethod == null)
        {
            return ApiResponse<DeletePaymentMethodResponse>.Fail("Payment method not found.");
        }

        var tenantMethodsQuery = unitOfWork.TenantPaymentMethodRepository.Query(pm => pm.TenantId == targetMethod.TenantId && !pm.IsDeleted);
        var methods = await unitOfWork.TenantPaymentMethodRepository.ToListAsync(tenantMethodsQuery, cancellationToken);

        if (methods.Count <= 1)
        {
            return ApiResponse<DeletePaymentMethodResponse>.Fail(
                "Cannot delete the only payment method. You must keep at least one active payment method or add an alternative first.");
        }

        var wasDefault = targetMethod.IsDefault;
        targetMethod.IsDeleted = true;
        targetMethod.DeletedAt = DateTime.UtcNow;

        Guid? promotedId = null;
        if (wasDefault)
        {
            var nextMethod = methods.FirstOrDefault(pm => pm.Id != targetMethod.Id);
            if (nextMethod != null)
            {
                nextMethod.IsDefault = true;
                nextMethod.UpdatedAt = DateTime.UtcNow;
                promotedId = nextMethod.Id;
            }
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<DeletePaymentMethodResponse>.Success(new DeletePaymentMethodResponse
        {
            PromotedDefaultId = promotedId
        });
    }
}
