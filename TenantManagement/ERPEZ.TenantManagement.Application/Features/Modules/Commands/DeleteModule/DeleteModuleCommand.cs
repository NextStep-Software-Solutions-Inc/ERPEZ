using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Modules.Commands.DeleteModule;

public record DeleteModuleCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
