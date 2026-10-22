namespace ERPEZ.Application.Features.Procurement.AOBs.Dtos;

public record AwardItemInputDto
{
    public required Guid RFQItemId { get; init; }
    public required Guid WinningSupplierId { get; init; }
    public required decimal AwardedUnitPrice { get; init; }
    public int AwardedQuantity { get; init; }
    public decimal TotalAwardedAmount { get; init; }
    public decimal Score { get; init; }
    public string? AwardReason { get; init; }
    public Guid? PurchaseOrderId { get; init; }
}
