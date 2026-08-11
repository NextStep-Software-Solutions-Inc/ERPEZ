using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Commands.CreatePM;

public class CreatePerformanceMeasureCommand : IRequest<ApiResponse<Guid>>
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
