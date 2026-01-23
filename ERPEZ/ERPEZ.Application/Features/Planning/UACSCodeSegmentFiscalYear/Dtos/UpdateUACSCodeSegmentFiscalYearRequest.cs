namespace ERPEZ.Application.Features.Planning.UACSCodeSegmentFiscalYear.Dtos;

/// <summary>
/// Request DTO for updating UACS code segment fiscal year association.
/// </summary>
public record UpdateUACSCodeSegmentFiscalYearRequest
{
    public Guid UACSCodeSegmentId { get; init; }
    public Guid FiscalYearId { get; init; }
    public DateTime EffectiveStartDate { get; init; }
    public DateTime? EffectiveEndDate { get; init; }
    public bool IsActive { get; init; }
}
