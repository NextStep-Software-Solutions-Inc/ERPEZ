using ERPEZ.Application.Features.Planning.KPI.Dtos;
using ERPEZ.Application.Features.Planning.PerformanceMeasure.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Commands.UpdatePM;

public class UpdatePerformanceMeasureCommand : IRequest<ApiResponse<Domain.Entities.Planning.PerformanceMeasure>>
{
    public Guid Id { get; set; }
    public required UpdatePerformanceMeasureDto UpdatePerformanceMeasure { get; set; }
}
