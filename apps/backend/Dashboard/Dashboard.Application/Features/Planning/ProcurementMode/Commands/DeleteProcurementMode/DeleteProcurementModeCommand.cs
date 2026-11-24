using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementMode.Commands.DeleteProcurementMode;

public record DeleteProcurementModeCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
