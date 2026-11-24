namespace ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.LoadProfile;

public record LoadProfileRequest
{
    public Guid DocumentProfileId { get; init; }
}