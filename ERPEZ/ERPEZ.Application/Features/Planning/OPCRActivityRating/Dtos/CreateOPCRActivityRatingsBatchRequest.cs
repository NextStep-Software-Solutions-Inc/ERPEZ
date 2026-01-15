namespace ERPEZ.Application.Features.Planning.OPCRActivityRating.Dtos;

/// <summary>
/// Request DTO for batch creation of OPCR Activity Ratings.
/// </summary>
public record CreateOPCRActivityRatingsBatchRequest
{
    public required Guid OPCRActivityId { get; init; }
    public int ActualAccomplishedValue { get; init; }
    public List<CreateOPCRActivityRatingItemRequest> Ratings { get; init; } = [];
}