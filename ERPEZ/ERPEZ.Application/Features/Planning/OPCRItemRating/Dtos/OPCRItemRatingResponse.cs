namespace ERPEZ.Application.Features.Planning.OPCRItemRating.Dtos;

public class OPCRItemRatingResponse
{
    public Guid Id { get; init; }
    public Guid OPCRItemId { get; init; }
    public Guid KPIMeasurementId { get; init; }
    public string Dimension { get; init; } = string.Empty;
    public decimal? SelfRating { get; init; }
    public decimal? PMTRating { get; init; }
    public string? PMTRemark { get; init; }
    public DateTime CreatedAt { get; init; }
    public string? CreatedBy { get; init; }
}