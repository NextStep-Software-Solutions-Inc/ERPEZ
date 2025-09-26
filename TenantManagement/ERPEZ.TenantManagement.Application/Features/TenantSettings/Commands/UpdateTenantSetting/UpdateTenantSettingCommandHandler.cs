using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSettings.Commands.UpdateTenantSetting;

public class UpdateTenantSettingCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateTenantSettingCommand, ApiResponse<TenantSetting>>
{
    public async Task<ApiResponse<TenantSetting>> Handle(UpdateTenantSettingCommand request, CancellationToken cancellationToken)
    {
        var tenantSetting = await unitOfWork.TenantSettingRepository.GetByIdAsync(request.Id, cancellationToken);

        if (tenantSetting == null) 
        {
            return new ApiResponse<TenantSetting>
            {
                Succeeded = false,
                Message = "Tenant setting not found.",
                Data = null
            };
        }

        if (tenantSetting.Name == request.Name)
        {
            return new ApiResponse<TenantSetting>
            {
                Succeeded = false,
                Message = "Tenant setting already exist.",
                Data = null
            };
        }

        tenantSetting.Name = request.Name;
        tenantSetting.BaseURL = request.BaseUrl;
        tenantSetting.BillingContactEmail = request.BillingContactEmail;
        tenantSetting.DbConnectionString = request.DbConnectionString;
        tenantSetting.TenantId = request.Id;

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return new ApiResponse<TenantSetting>
        {
            Succeeded = true,
            Message = "Tenant setting updated successfully.",
            Data = tenantSetting
        };
    }
}
