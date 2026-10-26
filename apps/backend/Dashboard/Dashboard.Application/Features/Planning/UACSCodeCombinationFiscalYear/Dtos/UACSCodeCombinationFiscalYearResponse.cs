namespace ERPEZ.Application.Features.Planning.UACSCodeCombinationFiscalYear.Dtos;

/// <summary>
/// Response DTO for UACS code combination fiscal year association.
/// </summary>
public record UACSCodeCombinationFiscalYearResponse
{
    public Guid Id { get; init; }
    public Guid UACSCodeCombinationId { get; init; }
    public Guid FiscalYearId { get; init; }
    public DateTime IsValidFrom { get; init; }
    public DateTime? IsValidTo { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public required string CreatedBy { get; init; }
}
