namespace ERPEZ.Application.Features.Planning.APP.Dtos;

public record APPPPMPResponse
{
    public Guid Id { get; init; }
    public Guid APPId { get; init; }
    public Guid PPMPId { get; init; }
    public string PPMPNumber { get; init; } = string.Empty;
    public string PPMPName { get; init; } = string.Empty;
    public Guid PPMPOfficeId { get; init; }
    public string PPMPOfficeName { get; init; } = string.Empty;
    public Guid PPMPFiscalYearId { get; init; }
    public string PPMPFiscalYearYear { get; init; } = string.Empty;
    public decimal PPMPTotalEstimatedBudget { get; init; }
    public string PPMPStatus { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
}
