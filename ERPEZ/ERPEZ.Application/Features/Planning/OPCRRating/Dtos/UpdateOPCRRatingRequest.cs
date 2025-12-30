namespace ERPEZ.Application.Features.Planning.OPCRRating.Dtos;

public record UpdateOPCRRatingRequest
{
    public int? NumericalRating { get; init; }
    public string? Remarks { get; init; }
}
