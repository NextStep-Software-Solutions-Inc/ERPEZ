namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.ApproveAOB;

public record ApproveAOBRequest
{
    public string? ApprovedBy { get; init; }
    public string? SignedDocumentUrl { get; init; }
    public string? Remarks { get; init; }
}
