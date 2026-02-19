namespace ERPEZ.Application.Features.Planning.PMT.Dtos;

public record UpdatePMTRequest
{
    public Guid? OrganizationId { get; init; }
    public int? ActiveYear { get; init; }
    public bool? IsManualWorkflow { get; init; }
    public bool? IsActive { get; init; }
}
