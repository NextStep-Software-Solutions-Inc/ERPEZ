using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPITarget.Commands.DeleteKPITarget;

public record DeleteKPITargetCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
