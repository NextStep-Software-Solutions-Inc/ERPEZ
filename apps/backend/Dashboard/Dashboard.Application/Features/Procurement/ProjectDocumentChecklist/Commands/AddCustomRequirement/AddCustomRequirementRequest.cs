namespace ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.AddCustomRequirement;

public record AddCustomRequirementRequest
{
    public required string CustomDocumentName { get; init; }
    public int             EnvelopeType       { get; init; }
    public int             OrderIndex         { get; init; }
    public Guid?           FileId             { get; init; }
}