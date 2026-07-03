namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Dtos;

public class CreateAPRItemDto
{
    public Guid APPItemId { get; set; }
    // Qty/UnitCost editable at selection time per "APP Pre-population" note (Image 8);
    // if null, handler snapshots straight from APPItem/PPMPItem.
    public decimal? QuantityRequested { get; set; }
    public decimal? UnitCost { get; set; }
}
