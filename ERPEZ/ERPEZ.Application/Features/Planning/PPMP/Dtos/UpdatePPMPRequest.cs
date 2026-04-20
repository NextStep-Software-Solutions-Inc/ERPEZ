namespace ERPEZ.Application.Features.Planning.PPMP.Dtos;

public record UpdatePPMPRequest
{
    public string? PPMPNumber { get; init; }
    public Guid? OfficeId { get; init; }
    public Guid? FiscalYearId { get; init; }
    public Guid? FundSourceId { get; init; }
    public Guid? LIBId { get; init; }
}
