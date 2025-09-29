using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSettings.Commands.UpdateTenantSetting;

public class UpdateTenantSettingCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateTenantSettingCommand, ApiResponse<TenantSetting>>
{
    public async Task<ApiResponse<TenantSetting>> Handle(UpdateTenantSettingCommand request, CancellationToken cancellationToken)
    {
        if (request?.UpdateTenantSetting == null)
        {
            return ApiResponse<TenantSetting>.Fail("Invalid request. UpdateTenantSetting cannot be null.");
        }

        var dto = request.UpdateTenantSetting;

        var existTenant = await unitOfWork.TenantRepository.GetByIdAsync(dto.TenantId, cancellationToken: cancellationToken);
        if (existTenant == null)
        {
            return ApiResponse<TenantSetting>.Fail("Tenant does not exist.");
        }

        var tenantSetting = await unitOfWork.TenantSettingRepository
            .FindAsync(ts => ts.Id == request.Id && ts.TenantId == dto.TenantId,
                       isDeleted: false,
                       cancellationToken: cancellationToken);

        if (tenantSetting == null)
        {
            return ApiResponse<TenantSetting>.Fail("Tenant setting not found.");
        }

        if (!string.IsNullOrWhiteSpace(dto.Name) && dto.Name != tenantSetting.Name)
        {
            var duplicate = await unitOfWork.TenantSettingRepository
                .FindAsync(ts => ts.Name == dto.Name && ts.TenantId == dto.TenantId && ts.Id != request.Id,
                           isDeleted: false,
                           cancellationToken: cancellationToken);

            if (duplicate != null)
            {
                return ApiResponse<TenantSetting>.Fail("Another tenant setting with the same name already exists for this tenant.");
            }
        }

        if (string.IsNullOrWhiteSpace(dto.Name) &&
            string.IsNullOrWhiteSpace(dto.BaseUrl) &&
            string.IsNullOrWhiteSpace(dto.BillingContactEmail) &&
            string.IsNullOrWhiteSpace(dto.DBConnectionString))
        {
            return ApiResponse<TenantSetting>.Fail("No changes found.");
        }

        if (!string.IsNullOrWhiteSpace(dto.Name))
            tenantSetting.Name = dto.Name;

        if (!string.IsNullOrWhiteSpace(dto.BaseUrl))
            tenantSetting.BaseURL = dto.BaseUrl;

        if (!string.IsNullOrWhiteSpace(dto.BillingContactEmail))
            tenantSetting.BillingContactEmail = dto.BillingContactEmail;

        if (!string.IsNullOrWhiteSpace(dto.DBConnectionString))
            tenantSetting.DbConnectionString = dto.DBConnectionString;

        if (dto.TenantId != Guid.Empty && dto.TenantId != tenantSetting.TenantId)
            tenantSetting.TenantId = dto.TenantId;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new ApiResponse<TenantSetting>
        {
            Succeeded = true,
            Message = "Tenant setting updated successfully.",
            Data = tenantSetting
        };
    }
}
