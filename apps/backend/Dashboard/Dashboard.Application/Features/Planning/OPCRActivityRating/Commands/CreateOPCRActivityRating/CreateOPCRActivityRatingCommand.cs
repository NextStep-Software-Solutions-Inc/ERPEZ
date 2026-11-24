using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityRating.Commands.CreateOPCRActivityRating;

public class CreateOPCRActivityRatingCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid OPCRActivityId { get; set; }
    public required Guid PerformanceMeasureId { get; set; }
    public int ActualAccomplishedValue { get; set; }
    public int Score { get; set; }
    public string? Remarks { get; set; }
}
