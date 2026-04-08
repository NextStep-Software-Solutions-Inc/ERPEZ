namespace ERPEZ.Application.Features.Planning.FundSource.Dtos;

public record FundSourceResponse
{
    public Guid Id { get; init; }
    public Guid? ParentId { get; init; }
    public required string Name { get; init; }
    public required string Code { get; init; }
    public required string Type { get; init; }
    public bool IsActive { get; init; }
    public Guid? FiscalYearId { get; init; }
    public required decimal TotalReceivedFunds { get; init; } = 0m;
    public required decimal TotalDUAllocatedFunds { get; init; } = 0m;
    public DateTime CreatedAt { get; init; }
    public required string CreatedBy { get; init; }
}
