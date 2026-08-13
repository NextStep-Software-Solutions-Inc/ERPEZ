using ERPEZ.Shared.Common;
using MediatR;
using ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Dtos;

namespace ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Commands.UpdateKPIPerformanceMeasure;

/// <summary>
/// Command to update an existing KPI Performance Measure association.
/// </summary>
public class UpdateKPIPerformanceMeasureCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdateKPIPerformanceMeasureRequest Dto { get; set; }
}
