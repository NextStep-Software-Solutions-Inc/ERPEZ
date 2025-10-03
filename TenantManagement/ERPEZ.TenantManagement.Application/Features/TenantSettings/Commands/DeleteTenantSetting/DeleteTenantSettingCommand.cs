using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantSettings.Commands.DeleteTenantSetting;

public record DeleteTenantSettingCommand(Guid Id) : IRequest<ApiResponse<Unit>>;