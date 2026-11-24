// Add to SupplierPortalDtos.cs

public record PublicApplicationStatusDto
{
    public Guid     Id                  { get; init; }
    public Guid     ProcurementProjectId { get; init; }
    public string   ProjectTitle        { get; init; } = string.Empty;
    public string   CompanyName         { get; init; } = string.Empty;
    public string   ContactPerson       { get; init; } = string.Empty;
    public string   EmailAddress        { get; init; } = string.Empty;
    public string   Status              { get; init; } = string.Empty;
    public DateTime SubmittedAt         { get; init; }
    public List<SubmittedDocumentDto> Documents { get; init; } = [];
}

public record SubmittedDocumentDto
{
    public Guid     ChecklistItemId  { get; init; }
    public string   DocumentName     { get; init; } = string.Empty;
    public string   OriginalFileName { get; init; } = string.Empty;
    public DateTime UploadedAt       { get; init; }
}