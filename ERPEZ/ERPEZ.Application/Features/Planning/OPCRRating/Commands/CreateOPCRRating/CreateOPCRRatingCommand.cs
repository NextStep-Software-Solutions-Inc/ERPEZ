using ERPEZ.Application.Features.Planning.OPCRRating.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRRating.Commands.CreateOPCRRating;

public class CreateOPCRRatingCommand : IRequest<ApiResponse<OPCRRatingResponse>>
{
    public Guid OPCREvaluationId { get; set; }
    public Guid PerformanceMeasureId { get; set; }
    public Guid OPCRKPIId { get; set; }
    public int NumericalRating { get; set; }
    public string? Remarks { get; set; }
}
