// UpdateOPCRReviewStatusRequest.cs
namespace ERPEZ.Application.Features.Planning.OPCR.Dtos;

public record UpdateOPCRReviewStatusRequest
{
    public required string ReviewStatus { get; set; }
}
