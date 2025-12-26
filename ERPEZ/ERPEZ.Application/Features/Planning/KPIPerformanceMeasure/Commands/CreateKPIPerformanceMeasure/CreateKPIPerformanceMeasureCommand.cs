using ERPEZ.Shared.Common;
using MediatR;
using ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Dtos;

namespace ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Commands.CreateKPIPerformanceMeasure;

/// <summary>
/// Command to create a new KPI Performance Measure association.
/// </summary>
public class CreateKPIPerformanceMeasureCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid KPIId { get; set; }
    public required Guid PerformanceMeasureId { get; set; }
}
