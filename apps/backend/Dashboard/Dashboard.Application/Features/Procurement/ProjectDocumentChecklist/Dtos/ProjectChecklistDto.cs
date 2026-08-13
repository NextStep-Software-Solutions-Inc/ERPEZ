namespace ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Dtos;

public record ProjectChecklistResponse
{
    public Guid   ProjectId      { get; init; }
    public int    TotalActive    { get; init; }

    /// <summary>
    /// True when the BAC has confirmed the checklist OR the project
    /// status has advanced past the point where edits are allowed.
    /// FE uses this to disable toggles and hide the Confirm button.
    /// </summary>
    public bool   IsLocked       { get; init; }

    public List<ChecklistItemDto> Envelope1Items { get; init; } = [];
    public List<ChecklistItemDto> Envelope2Items { get; init; } = [];
}

public record ChecklistItemDto
{
    public Guid    Id                   { get; init; }
    public string  DocumentName         { get; init; } = string.Empty;
    public bool    IsCustom             { get; init; }
    public bool    IsRequired           { get; init; }
    public int     EnvelopeType         { get; init; }
    public int     OrderIndex           { get; init; }
    public string? TemplateFileUrl      { get; init; }
    public Guid?   MasterDocumentTypeId { get; init; }
}