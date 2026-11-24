namespace ERPEZ.Application.Features.Planning.Psdbm.Dtos;

public record PsdbmItemDetailsDto
{
    public required string ItemCode { get; init; }
    public required string Description { get; init; }
    public decimal UnitPrice { get; init; }
    public required string Unit { get; init; }
    public required string Category { get; init; }
    public required string Status { get; init; }
    public int AvailableStock { get; init; }
    public int RemainingQtyForDelivery { get; init; }
    public string? ImageUrl { get; init; }
    public string? TechnicalSpecificationUrl { get; init; }
    public string? Depot { get; init; }
    public string? Mode { get; init; }
}
