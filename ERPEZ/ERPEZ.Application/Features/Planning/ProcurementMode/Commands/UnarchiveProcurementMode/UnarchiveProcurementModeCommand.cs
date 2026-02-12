using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementMode.Commands.UnarchiveProcurementMode;

public record UnarchiveProcurementModeCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
