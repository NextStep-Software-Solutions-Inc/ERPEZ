namespace ERPEZ.Application.Features.Planning.OPCRConsolidation.Dtos;

public record OPCRConsolidationDetailedResponse
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public Guid FiscalYearId { get; init; }
    public int FiscalYear { get; init; }
    public required List<OPCRConsolidationItemResponse> OPCRs { get; init; }
    public DateOnly CreatedDate { get; init; }
}

public record OPCRConsolidationItemResponse
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Code { get; init; }
    public Guid OfficeId { get; init; }
    public required string OfficeName { get; init; }
}