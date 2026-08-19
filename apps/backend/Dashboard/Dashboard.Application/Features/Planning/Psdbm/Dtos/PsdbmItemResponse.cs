namespace ERPEZ.Application.Features.Planning.Psdbm.Dtos;

public record PsdbmItemDto
{
    public Guid? Id { get; init; }
    public required string ItemCode { get; init; }
    public required string Description { get; init; }
    public decimal UnitPrice { get; init; }
    public required string Unit { get; init; }
    public required string Availability { get; init; }
    public string? Category { get; init; }
    public int AvailableStock { get; init; }
    public int RemainingQtyForDelivery { get; init; }
    public string? ImageUrl { get; init; }
    public string? TechnicalSpecificationUrl { get; init; }
    public DateTime? LastSyncedAt { get; init; }
    public string? Depot { get; init; }
}

public record GetPsdbmItemsResponse
{
    public List<PsdbmItemDto> Items { get; init; } = [];
    public int TotalItems { get; init; }
    public string? Category { get; init; }
    public string? SearchTerm { get; init; }
    public required string Mode { get; init; }
    public string? Depot { get; init; }
    public DateTime? LastSynchronizedAt { get; init; }
}

public record PsdbmProductDetailDto
{
    public Guid Id { get; init; }
    public required string ItemCode { get; init; }
    public required string Description { get; init; }
    public required string Category { get; init; }
    public required string Unit { get; init; }
    public string? ImageUrl { get; init; }
    public string? TechnicalSpecificationUrl { get; init; }
    public bool IsActive { get; init; }
    public List<PsdbmDepotStockDto> DepotStocks { get; init; } = [];
}

public record PsdbmDepotStockDto
{
    public Guid DepotId { get; init; }
    public required string DepotName { get; init; }
    public string? Region { get; init; }
    public string? Mode { get; init; }
    public decimal Price { get; init; }
    public required string Availability { get; init; }
    public int AvailableStock { get; init; }
    public int RemainingQtyForDelivery { get; init; }
    public DateTime LastSyncedAt { get; init; }
}