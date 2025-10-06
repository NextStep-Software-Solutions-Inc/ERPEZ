using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSettings.Commands.UpdateTenantSetting;

public class UpdateTenantSettingCommandHandler(IUnitOfWork _unitOfWork)
    : IRequestHandler<UpdateTenantSettingCommand, ApiResponse<TenantSetting>>
{
    public async Task<ApiResponse<TenantSetting>> Handle(UpdateTenantSettingCommand request, CancellationToken cancellationToken)
    {
        if (request?.UpdateTenantSetting == null) throw new NotFoundException("Update tenant setting cannot be null.");

        var dto = request.UpdateTenantSetting;

        var existTenant = await _unitOfWork.TenantRepository.GetByIdAsync(dto.TenantId, cancellationToken: cancellationToken) ?? throw new NotFoundException("Tenant cannot be found.");
        var tenantSetting = await _unitOfWork.TenantSettingRepository
            .FindAsync(ts => ts.Id == request.Id && ts.TenantId == dto.TenantId, cancellationToken: cancellationToken) ?? throw new NotFoundException("Tenant setting not found");
        
        if (!string.IsNullOrWhiteSpace(dto.Name) && dto.Name != tenantSetting.Name)
        {
            var duplicate = await _unitOfWork.TenantSettingRepository
                .FindAsync(ts => ts.Name == dto.Name && ts.TenantId == dto.TenantId && ts.Id != request.Id, cancellationToken: cancellationToken);

            if (duplicate != null) throw new ConflictException("Another tenant setting with the same name already exists for this tenant.");
        }

        tenantSetting.Name = dto.Name ?? tenantSetting.Name;
        tenantSetting.BaseURL = dto.BaseUrl ?? tenantSetting.BaseURL;
        tenantSetting.BillingContactEmail = dto.BillingContactEmail ?? tenantSetting.BillingContactEmail;
        tenantSetting.DbConnectionString = dto.DBConnectionString ?? tenantSetting.DbConnectionString;
        tenantSetting.TenantId = dto?.TenantId ?? tenantSetting.TenantId;

         _unitOfWork.TenantSettingRepository.Update(tenantSetting);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<TenantSetting>.Success(tenantSetting, "Tenant setting updated successfully.");
    }
}
