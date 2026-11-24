namespace ERPEZ.Application.Features.Procurement.DocumentProfile.Dtos;

public record DocumentProfileDto
{
    public Guid    Id                  { get; init; }
    public string  Name                { get; init; } = string.Empty;
    public string? Description         { get; init; }
    public string  ProcurementCategory { get; init; } = string.Empty;
    public int     ItemCount           { get; init; }
    public int     TechCount           { get; init; }
    public int     FinCount            { get; init; }
    public List<DocumentProfileItemDto> Items { get; init; } = [];
    public DateTime CreatedAt          { get; init; }
}

public record DocumentProfileItemDto
{
    public Guid    Id                   { get; init; }
    public Guid    MasterDocumentTypeId { get; init; }
    public string  DocumentName         { get; init; } = string.Empty;
    public int     EnvelopeType         { get; init; }
    public int     OrderIndex           { get; init; }
    public string? TemplateFileUrl      { get; init; }
}