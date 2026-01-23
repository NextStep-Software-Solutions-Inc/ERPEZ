namespace ERPEZ.Application.Features.Planning.UACSCodeCombinationFiscalYear.Dtos;

/// <summary>
/// Request DTO for updating UACS code combination fiscal year association.
/// </summary>
public record UpdateUACSCodeCombinationFiscalYearRequest
{
    public Guid UACSCodeCombinationId { get; init; }
    public Guid FiscalYearId { get; init; }
    public DateTime IsValidFrom { get; init; }
    public DateTime? IsValidTo { get; init; }
    public bool IsActive { get; init; }
}
