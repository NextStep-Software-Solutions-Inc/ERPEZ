namespace ERPEZ.Application.Features.Planning.EconomicIndicator.Dtos;

public record EconomicIndicatorResponse
{
    public Guid Id { get; init; }
    public Guid FiscalYearId { get; init; }
    public int FiscalYearYear { get; init; }
    public decimal VATRate { get; init; }
    public decimal InflationRate { get; init; }
    public decimal IncomeTaxRate { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
}
