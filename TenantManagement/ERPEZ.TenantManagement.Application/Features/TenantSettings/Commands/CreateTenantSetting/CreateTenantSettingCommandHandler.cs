using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSettings.Commands.CreateTenantSetting;

public sealed class CreateTenantSettingCommandHandler : IRequestHandler<CreateTenantSettingCommand, ApiResponse<TenantSetting>>
{
    private readonly ITenantSettingRepository _tenantSettingRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateTenantSettingCommandHandler(ITenantSettingRepository tenantSettingRepository, IUnitOfWork unitOfWork)
    {
        _tenantSettingRepository = tenantSettingRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<TenantSetting>> Handle(CreateTenantSettingCommand command, CancellationToken cancellationToken)
    {
        var existTenantSetting = await _unitOfWork.TenantSettingRepository.FindAsync(ts => ts.Name == command.Name &&
        ts.TenantId == command.TenantId);
        if (existTenantSetting != null)
        {
            return new()
            {
                Succeeded = false,
                Message = "Tenant setting already exist."
            };
        }
        var existTenant = await _unitOfWork.TenantRepository.GetByIdAsync(command.TenantId, cancellationToken: cancellationToken);
        if(existTenant == null)
        {
            return new()
            {
                Succeeded = false,
                Message = "Tenant does not exist."
            };
        }
        var tenantSetting = new TenantSetting
        {
            TenantId = command.TenantId,
            Name = command.Name,
            BaseURL = command.BaseUrl,
            BillingContactEmail = command.BillingContactEmail,
            DbConnectionString = command.DBConnectionString
        };

        await _tenantSettingRepository.AddAsync(tenantSetting, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return new()
        {
            Succeeded = true,
            Message = "Tenant setting created successfully."
        };
    }
}
