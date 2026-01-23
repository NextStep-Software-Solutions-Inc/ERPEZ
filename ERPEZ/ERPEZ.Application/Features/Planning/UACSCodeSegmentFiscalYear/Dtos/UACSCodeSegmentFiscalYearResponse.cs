namespace ERPEZ.Application.Features.Planning.UACSCodeSegmentFiscalYear.Dtos;

/// <summary>
/// Response DTO for UACS code segment fiscal year association.
/// </summary>
public record UACSCodeSegmentFiscalYearResponse
{
    public Guid Id { get; init; }
    public Guid UACSCodeSegmentId { get; init; }
    public Guid FiscalYearId { get; init; }
    public DateTime EffectiveStartDate { get; init; }
    public DateTime? EffectiveEndDate { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public required string CreatedBy { get; init; }
}
