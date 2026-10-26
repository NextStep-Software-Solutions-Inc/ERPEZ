namespace ERPEZ.Application.Features.Procurement.Contracts.Dtos;

/// <summary>
/// Status counts and financial summary for the Contract dashboard.
/// </summary>
public record ContractSummaryDto
{
    public int Total { get; init; }
    public int Draft { get; init; }
    public int ForApproval { get; init; }
    public int Approved { get; init; }
    public int Executed { get; init; }
    public int Returned { get; init; }
    public int Cancelled { get; init; }
    public decimal TotalValue { get; init; }
}
