namespace ERPEZ.Application.Features.Planning.OPCR.Dtos;

public record UpdateOPCRRequest
{
    public Guid? DeliveryUnitId { get; set; }
    public int? FiscalYear { get; set; }
}
