namespace ERPEZ.Application.Features.Planning.OPCRActivityRating.Dtos;

/// <summary>
/// Represents a single OPCR Activity Rating item for batch creation.
/// </summary>
public record CreateOPCRActivityRatingItemRequest
{
    public required Guid PerformanceMeasureId { get; init; }
    public int Score { get; init; }
    public string? Remarks { get; init; }
}