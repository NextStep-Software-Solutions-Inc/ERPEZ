using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Commands.DeleteKPIPerformanceMeasure;

/// <summary>
/// Command to delete a KPI Performance Measure association.
/// </summary>
public class DeleteKPIPerformanceMeasureCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }

    public DeleteKPIPerformanceMeasureCommand(Guid id)
    {
        Id = id;
    }
}
