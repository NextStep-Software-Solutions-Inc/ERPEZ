namespace ERPEZ.Application.Features.Planning.PPMP.Dtos;

public record GetPPMPApprovalHistoryRequest
{
    public Guid PPMPId { get; init; }
}
