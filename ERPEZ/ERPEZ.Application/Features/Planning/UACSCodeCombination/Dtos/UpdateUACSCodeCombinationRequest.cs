namespace ERPEZ.Application.Features.Planning.UACSCodeCombination.Dtos;

public record UpdateUACSCodeCombinationRequest
{
    public Guid? FundSourceId { get; init; }
    public Guid? OrganizationId { get; init; }
    public Guid? LocationId { get; init; }
    public Guid? MFOPAPId { get; init; }
    public Guid? ObjectId { get; init; }
    public required string CombinationCode { get; init; }
    public required string Description { get; init; }
    public bool IsValid { get; init; }
    public Guid? FiscalYearId { get; init; }
    public DateTime EffectiveDate { get; init; }
    public DateTime? ExpiryDate { get; init; }
    public bool IsActive { get; init; }
}
