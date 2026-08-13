namespace ERPEZ.Application.Features.Planning.Psdbm.Dtos;

public record PsdbmItemDto
{
    public required string ItemCode { get; init; }
    public required string Description { get; init; }
    public decimal UnitPrice { get; init; }
    public required string Unit { get; init; }
    public required string Availability { get; init; }
}

public record GetPsdbmItemsResponse
{
    public List<PsdbmItemDto> Items { get; init; } = new();
    public int TotalItems { get; init; }
    public string? Category { get; init; }
    public string? SearchTerm { get; init; }
    public required string Mode { get; init; }
    public string? Depot { get; init; }
}