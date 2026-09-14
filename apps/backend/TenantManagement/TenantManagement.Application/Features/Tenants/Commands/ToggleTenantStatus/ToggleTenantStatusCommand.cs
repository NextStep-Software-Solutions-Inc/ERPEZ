using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Commands.ToggleTenantStatus;

public record ToggleTenantStatusCommand(Guid TenantId, bool IsDisabled) : IRequest<ApiResponse<bool>>;

public class ToggleTenantStatusCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<ToggleTenantStatusCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(ToggleTenantStatusCommand request, CancellationToken cancellationToken)
    {
        var tenant = await unitOfWork.TenantRepository.GetByIdAsync(request.TenantId, cancellationToken);
        if (tenant == null)
        {
            return ApiResponse<bool>.Fail("Tenant not found.");
        }

        tenant.IsDisabled = request.IsDisabled;
        unitOfWork.TenantRepository.Update(tenant);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var message = request.IsDisabled ? "Tenant has been disabled." : "Tenant has been enabled.";
        return ApiResponse<bool>.Success(tenant.IsDisabled, message);
    }
}
