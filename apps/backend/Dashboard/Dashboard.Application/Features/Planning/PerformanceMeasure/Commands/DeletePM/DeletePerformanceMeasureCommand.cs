using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Commands.DeletePM;

public record DeletePerformanceMeasureCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
