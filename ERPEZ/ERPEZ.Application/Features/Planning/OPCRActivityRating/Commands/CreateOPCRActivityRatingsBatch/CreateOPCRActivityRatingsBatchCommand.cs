using ERPEZ.Application.Features.Planning.OPCRActivityRating.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityRating.Commands.CreateOPCRActivityRatingsBatch;

/// <summary>
/// Command for creating multiple OPCR Activity Ratings in a single request.
/// </summary>
public class CreateOPCRActivityRatingsBatchCommand : IRequest<ApiResponse<Unit>>
{
    public required Guid OPCRActivityId { get; set; }
    public int ActualAccomplishedValue { get; set; }
    public List<CreateOPCRActivityRatingItemRequest> Ratings { get; set; } = [];
}