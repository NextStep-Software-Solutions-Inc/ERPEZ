namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.DTOs;

public record RetailStoreInfoDto
{
    public string Name { get; init; } = string.Empty;
    public string? TIN { get; init; }
    public string? Address { get; init; }
}
