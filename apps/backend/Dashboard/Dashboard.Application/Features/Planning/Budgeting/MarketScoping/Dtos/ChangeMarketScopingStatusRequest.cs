namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Dtos;

/// <summary>
/// Request DTO for changing market scoping status.
/// </summary>
public record ChangeMarketScopingStatusRequest
{
    public required Guid MarketScopingId { get; set; }
    public required string Status { get; set; }
    public string? ChangeReason { get; set; }
}
