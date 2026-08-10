using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSettings.Queries.GetTenantSettingById;

public sealed class GetTenantSettingByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetTenantSettingByIdQuery, ApiResponse<TenantSetting>>
{
    public async Task<ApiResponse<TenantSetting>> Handle(
        GetTenantSettingByIdQuery request,
        CancellationToken cancellationToken)
    {
        var tenantSetting = await unitOfWork.TenantSettingRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Tenant setting not found.");

        return ApiResponse<TenantSetting>.Success(tenantSetting, "Tenant setting retrieved successfully.");
    }
}
