namespace ERPEZ.Application.Features.Planning.OPCRItemRating.Commands.UpdateOPCRItemRating;

public class UpdateOPCRItemRatingRequest
{
    public decimal? SelfRating { get; init; }
    public decimal? PMTRating { get; init; }
    public string? PMTRemark { get; init; }
}