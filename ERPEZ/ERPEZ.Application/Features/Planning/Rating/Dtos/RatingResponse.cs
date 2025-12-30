namespace ERPEZ.Application.Features.Planning.Rating.Dtos;

public record RatingResponse
{
    public Guid Id { get; init; }
    
    public Guid KPIId { get; init; }
    public Guid PerformanceMeasureId { get; init; }
    public int NumericalRating { get; init; }
    public string? Remarks { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
}
