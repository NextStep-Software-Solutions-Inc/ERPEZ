using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Commands.UpdatePM;

public class UpdatePerformanceMeasureCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdatePerformanceMeasureRequest UpdatePerformanceMeasure { get; set; }
}
