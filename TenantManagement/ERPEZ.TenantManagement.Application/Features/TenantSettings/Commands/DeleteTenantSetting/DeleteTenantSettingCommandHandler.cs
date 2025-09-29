using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSettings.Commands.DeleteTenantSetting;

public sealed class DeleteTenantSettingCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteTenantSettingCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteTenantSettingCommand request, CancellationToken cancellationToken)
    {
        var tenantSetting = await unitOfWork.TenantSettingRepository.GetByIdAsync(request.Id, isDeleted:false, cancellationToken: cancellationToken);

        if (tenantSetting == null)
        {
            return new ApiResponse<Unit>()
            {
                Succeeded = false,
                Message = "Tenant setting not found."
            };
        }

        tenantSetting.MarkAsDeleted(request.Id);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Tenant setting deleted successfully.");
    }
}
