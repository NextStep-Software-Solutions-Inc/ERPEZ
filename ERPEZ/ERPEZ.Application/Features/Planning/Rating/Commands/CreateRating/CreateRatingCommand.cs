using ERPEZ.Application.Features.Planning.Rating.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Rating.Commands.CreateRating;

public class CreateRatingCommand : IRequest<ApiResponse<Guid>>
{
    public Guid KPIId { get; set; }
    public Guid PerformanceMeasureId { get; set; }
    public int NumericalRating { get; set; }
    public string? Remarks { get; set; }
}
