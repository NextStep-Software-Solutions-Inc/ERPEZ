namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Dtos;

public record AwardedLineItemDto
{
    public string Id { get; init; } = string.Empty;
    public string ItemName { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public string Unit { get; init; } = string.Empty;
    public decimal UnitPrice { get; init; }
    public decimal Amount { get; init; }
}
