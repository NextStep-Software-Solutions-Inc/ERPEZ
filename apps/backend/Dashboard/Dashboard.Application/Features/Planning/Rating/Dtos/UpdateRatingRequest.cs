namespace ERPEZ.Application.Features.Planning.Rating.Dtos;

public record UpdateRatingRequest
{
    public int? NumericalRating { get; init; }
    public string? Remarks { get; init; }
}
