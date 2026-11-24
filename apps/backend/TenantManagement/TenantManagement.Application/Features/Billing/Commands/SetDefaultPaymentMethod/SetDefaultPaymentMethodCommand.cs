using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Billing.Commands.SetDefaultPaymentMethod;

public record SetDefaultPaymentMethodCommand(Guid Id) : IRequest<ApiResponse<Unit>>;

public class SetDefaultPaymentMethodCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<SetDefaultPaymentMethodCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        SetDefaultPaymentMethodCommand command,
        CancellationToken cancellationToken)
    {
        var query = unitOfWork.TenantPaymentMethodRepository.Query(pm => pm.Id == command.Id && !pm.IsDeleted);
        var targetMethod = await unitOfWork.TenantPaymentMethodRepository.GetFirstAsync(query, cancellationToken);

        if (targetMethod == null)
        {
            return ApiResponse<Unit>.Fail("Payment method not found.");
        }

        var tenantMethodsQuery = unitOfWork.TenantPaymentMethodRepository.Query(pm => pm.TenantId == targetMethod.TenantId && !pm.IsDeleted);
        var methods = await unitOfWork.TenantPaymentMethodRepository.ToListAsync(tenantMethodsQuery, cancellationToken);

        foreach (var pm in methods)
        {
            pm.IsDefault = pm.Id == targetMethod.Id;
            pm.UpdatedAt = DateTime.UtcNow;
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
