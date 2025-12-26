namespace ERPEZ.Application.Features.Planning.KPIRating.Dtos;

public record CreateKPIRatingRequest
{
    public required Guid PerformanceMeasureId { get; init; }
    public required List<NumericalKPIRatingRequest> Ratings { get; init; } = [];
}
public record NumericalKPIRatingRequest
{
    public required int Value { get; init; }
    public string? Remarks { get; init; }
}
