using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.OPCRActivityRating.Dtos;

public record UpdateOPCRRatingStatusRequest
{
    public required OPCRRatingStatus Status { get; init; }
}
