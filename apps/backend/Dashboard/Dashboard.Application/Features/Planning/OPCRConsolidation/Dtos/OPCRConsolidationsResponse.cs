namespace ERPEZ.Application.Features.Planning.OPCRConsolidation.Dtos;

public record OPCRConsolidationsResponse
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public Guid FiscalYearId { get; init; }
    public int FiscalYear { get; init; }
    public int OPCRCount { get; init; }
    public DateOnly CreatedDate { get; init; }
}