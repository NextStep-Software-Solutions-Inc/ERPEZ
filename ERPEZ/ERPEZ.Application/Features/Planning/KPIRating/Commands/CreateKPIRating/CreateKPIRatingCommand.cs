using ERPEZ.Application.Features.Planning.KPIRating.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIRating.Commands.CreateKPIRating;

public class CreateKPIRatingCommand : IRequest<ApiResponse<KPIRatingResponse>>
{
    public Guid KPIId { get; set; }
    public Guid PerformanceMeasureId { get; set; }
    public int NumericalRating { get; set; }
    public string? Remarks { get; set; }
}
