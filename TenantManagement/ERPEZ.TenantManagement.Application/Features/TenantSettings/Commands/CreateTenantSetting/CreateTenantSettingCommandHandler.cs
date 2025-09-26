using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSettings.Commands.CreateTenantSetting;

public sealed class CreateTenantSettingCommandHandler : IRequestHandler<CreateTenantSettingCommand, Guid>
{
    private readonly ITenantSettingRepository _tenantSettingRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateTenantSettingCommandHandler(ITenantSettingRepository tenantSettingRepository, IUnitOfWork unitOfWork)
    {
        _tenantSettingRepository = tenantSettingRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateTenantSettingCommand command, CancellationToken cancellationToken)
    {
        var tenantSetting = new TenantSetting
        {
            TenantId = command.TenantId,
            Name = command.Name,
            BaseURL = command.BaseUrl,
            BillingContactEmail = command.BillingContactEmail,
            DbConnectionString = command.DBConnectionString
        };

        await _tenantSettingRepository.AddAsync(tenantSetting);
        await _unitOfWork.SaveChangesAsync();
        return tenantSetting.Id;
    }
}
