namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Dtos;

public record WorkflowMatrixResponse
{
    public Guid Id { get; init; }
    public Guid FiscalYearId { get; init; }
    public int FiscalYearYear { get; init; }
    public Guid OrganizationId { get; init; }
    public string OrganizationName { get; init; } = string.Empty;
    public string? DocumentType { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
}
