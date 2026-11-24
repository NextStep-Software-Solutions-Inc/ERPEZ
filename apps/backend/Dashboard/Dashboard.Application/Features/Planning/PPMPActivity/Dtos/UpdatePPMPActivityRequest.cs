namespace ERPEZ.Application.Features.Planning.PPMPActivity.Dtos;

public record UpdatePPMPActivityRequest
{
    public Guid? LIBActivityId { get; init; }
}
