
namespace ERPEZ.Application.Features.Planning.OPCRActivityRating.Dtos;

public record UpdateOPCRActivityRatingRequest
{
    public int? ActualAccomplishedValue { get; init; }
    public int? Score { get; init; }
    public string? Remarks { get; init; }
}
