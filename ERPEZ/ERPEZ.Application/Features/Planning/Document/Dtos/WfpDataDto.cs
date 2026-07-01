using ERPEZ.Application.Features.Planning.Document.Dtos;

namespace ERPEZ.Application.Common.Dtos;

/// <summary>
/// Top-level DTO consumed by the WFP document renderers (PDF and Excel).
/// Built by GenerateWfpDocumentCommandHandler.MapToWfpDataDto; mirrors LibDataDto's
/// role as the renderer-facing payload, decoupled from the inbound command.
/// </summary>
public record WfpDataDto
{
    public string    ProjectTitle     { get; init; } = string.Empty;
    public string    ProjectOwner     { get; init; } = string.Empty;
    public string    OfficeName       { get; init; } = string.Empty;
    public DateOnly  ProjectStartDate { get; init; }
    public DateOnly  ProjectEndDate   { get; init; }
    public int       DurationMonths   { get; init; }

    public List<WfpObjectiveDto> Objectives  { get; init; } = [];
    public List<SignatoryDto>    Signatories { get; init; } = [];
}
