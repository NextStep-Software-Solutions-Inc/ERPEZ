namespace ERPEZ.Application.Features.Procurement.MasterDocumentType.Dtos;

public record MasterDocumentTypeDto
{
    public Guid    Id              { get; init; }
    public string  Name            { get; init; } = string.Empty;
    public string? Description     { get; init; }
    public int     EnvelopeType    { get; init; }
    public string  EnvelopeLabel   => EnvelopeType == 1 ? "Envelope 1: Technical" : "Envelope 2: Financial";
    public string? TemplateFileUrl { get; init; }
    public DateTime CreatedAt      { get; init; }
}