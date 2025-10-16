using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPITarget.Commands.DeleteKPITarget;

public record class DeleteKPITargetCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
