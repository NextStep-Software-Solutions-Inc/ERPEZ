using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementModeThreshold.Commands.DeleteProcurementModeThreshold;

public record DeleteProcurementModeThresholdCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
