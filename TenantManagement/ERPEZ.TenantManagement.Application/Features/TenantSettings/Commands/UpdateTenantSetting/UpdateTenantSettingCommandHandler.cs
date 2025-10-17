using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSettings.Commands.UpdateTenantSetting;

public class UpdateTenantSettingCommandHandler(IUnitOfWork _unitOfWork)
    : IRequestHandler<UpdateTenantSettingCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(UpdateTenantSettingCommand request, CancellationToken cancellationToken)
    {
        if (request?.UpdateTenantSetting == null) throw new NotFoundException("Update tenant setting cannot be null.");

        var dto = request.UpdateTenantSetting;

        var tenantSetting = await _unitOfWork.TenantSettingRepository.FindAsync(ts => ts.TenantId == dto.TenantId, cancellationToken: cancellationToken) ?? throw new NotFoundException("Tenant settings cannot be found.");

        tenantSetting.BaseURL = dto.BaseUrl ?? tenantSetting.BaseURL;
        tenantSetting.BillingContactEmail = dto.BillingContactEmail ?? tenantSetting.BillingContactEmail;
        tenantSetting.DbConnectionString = dto.DBConnectionString ?? tenantSetting.DbConnectionString;

         _unitOfWork.TenantSettingRepository.Update(tenantSetting);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(tenantSetting.Id, "Tenant setting updated successfully.");
    }
}
