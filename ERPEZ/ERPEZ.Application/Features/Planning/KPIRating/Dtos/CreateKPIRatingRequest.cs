namespace ERPEZ.Application.Features.Planning.KPIRating.Dtos;

public record CreateKPIRatingRequest
{
    public required Guid PerformanceMeasureId { get; init; }
    public required List<NumericalRatingRequest> Ratings { get; init; } = [];
}
public record NumericalRatingRequest
{
    public required int Value { get; init; }
    public string? Remarks { get; init; }
}
