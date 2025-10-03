using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSettings.Queries.GetTenantSettingById;

public sealed class GetTenantSettingByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetTenantSettingByIdQuery, TenantSetting?>
{
    public async Task<TenantSetting?> Handle(
        GetTenantSettingByIdQuery request,
        CancellationToken cancellationToken)
    {
        var tenantSetting = await unitOfWork.TenantSettingRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken);

        return tenantSetting;
    }
}
