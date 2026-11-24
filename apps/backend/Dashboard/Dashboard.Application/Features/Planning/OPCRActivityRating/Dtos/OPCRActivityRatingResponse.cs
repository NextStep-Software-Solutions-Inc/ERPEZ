namespace ERPEZ.Application.Features.Planning.OPCRActivityRating.Dtos;

public record OPCRActivityRatingResponse
{
    public Guid Id { get; init; }
    public Guid OPCRActivityId { get; init; }
    public Guid PerformanceMeasureId { get; init; }
    public int ActualAccomplishedValue { get; init; }
    public int Score { get; init; }
    public string? Remarks { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
}
