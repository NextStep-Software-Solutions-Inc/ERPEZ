namespace ERPEZ.Application.Features.Planning.ItemPrice.Dtos;

public record UpdateItemPriceRequest
{
    public Guid ProcurementItemId { get; init; }
    public Guid FiscalYearId { get; init; }
    public decimal UnitPrice { get; init; }
}
