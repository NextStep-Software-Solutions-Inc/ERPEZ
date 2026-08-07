namespace ERPEZ.Application.Features.Planning.KPIRating.Dtos;

public record UpdateKPIRatingRequest
{
    public int? NumericalRating { get; init; }
    public string? Remarks { get; init; }
}
