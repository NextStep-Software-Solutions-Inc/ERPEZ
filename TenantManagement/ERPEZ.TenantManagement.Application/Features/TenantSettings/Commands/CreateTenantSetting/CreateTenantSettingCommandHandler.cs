using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSettings.Commands.CreateTenantSetting;

public sealed class CreateTenantSettingCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateTenantSettingCommand, ApiResponse<TenantSetting>>
{
    public async Task<ApiResponse<TenantSetting>> Handle(CreateTenantSettingCommand command, CancellationToken cancellationToken)
    {
        var existTenantSetting = await _unitOfWork.TenantSettingRepository.FindAsync(ts => ts.Name == command.Name &&
        ts.TenantId == command.TenantId, cancellationToken);

        if (existTenantSetting != null) throw new ConflictException("Tenant setting already exist.");
        
        var existTenant = await _unitOfWork.TenantRepository.GetByIdAsync(command.TenantId, cancellationToken: cancellationToken) ?? throw new NotFoundException("Tenant setting not found.");

        var tenantSetting = new TenantSetting
        {
            TenantId = command.TenantId,
            Name = command.Name,
            BaseURL = command.BaseUrl,
            BillingContactEmail = command.BillingContactEmail,
            DbConnectionString = command.DBConnectionString
        };

        await _unitOfWork.TenantSettingRepository.AddAsync(tenantSetting, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<TenantSetting>.Success(tenantSetting, "Tenant setting created successfully.");
    }
}
