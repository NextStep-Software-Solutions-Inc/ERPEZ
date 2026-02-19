namespace ERPEZ.Application.Features.Planning.ItemPrice.Dtos;

public record ItemPriceResponse
{
    public Guid Id { get; init; }
    public decimal UnitPrice { get; init; }
    public Guid ProcurementItemId { get; init; }
    public string ProcurementItemName { get; init; } = string.Empty;
    public Guid FiscalYearId { get; init; }
    public string FiscalYearYear { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

public record ItemPriceDetailedResponse
{
    public Guid Id { get; init; }
    public decimal UnitPrice { get; init; }
    public Guid ProcurementItemId { get; init; }
    public ProcurementItemInfo? ProcurementItem { get; init; }
    public Guid FiscalYearId { get; init; }
    public FiscalYearInfo? FiscalYear { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

public record ProcurementItemInfo
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Specifications { get; init; }
    public string Type { get; init; } = string.Empty;
    public string? ProductCode { get; init; }
}

public record FiscalYearInfo
{
    public Guid Id { get; init; }
    public string Year { get; init; } = string.Empty;
}
