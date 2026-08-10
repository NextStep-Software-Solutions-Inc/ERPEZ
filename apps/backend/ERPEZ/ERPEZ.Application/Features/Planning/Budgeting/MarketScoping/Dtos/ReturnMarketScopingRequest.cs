namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;

/// <summary>
/// Request DTO for returning a Market Scoping form for revision.
/// </summary>
public record ReturnMarketScopingRequest
{
    public string? Remarks { get; set; }
}
