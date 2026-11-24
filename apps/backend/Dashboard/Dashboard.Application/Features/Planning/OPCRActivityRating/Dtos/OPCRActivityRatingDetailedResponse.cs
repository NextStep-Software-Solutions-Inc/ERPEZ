namespace ERPEZ.Application.Features.Planning.OPCRActivityRating.Dtos;

public record OPCRActivityRatingDetailedResponse
{
    public Guid Id { get; init; }
    public Guid OPCRActivityId { get; init; }
    public string OPCRActivityName { get; init; } = string.Empty;
    public Guid PerformanceMeasureId { get; init; }
    public string PerformanceMeasureName { get; init; } = string.Empty;
    public int ActualAccomplishedValue { get; init; }
    public int Score { get; init; }
    public string? Remarks { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
}
