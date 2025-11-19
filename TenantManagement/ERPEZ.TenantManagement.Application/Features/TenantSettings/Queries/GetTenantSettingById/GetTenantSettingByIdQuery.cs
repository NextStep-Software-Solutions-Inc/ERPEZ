using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Domain.Entities;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSettings.Queries.GetTenantSettingById;

public record GetTenantSettingByIdQuery(Guid Id) : IRequest<ApiResponse<TenantSetting>>;
