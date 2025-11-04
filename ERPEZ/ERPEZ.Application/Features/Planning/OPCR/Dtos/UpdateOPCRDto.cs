namespace ERPEZ.Application.Features.Planning.OPCR.Dtos;

public class UpdateOPCRDto
{
    public Guid? DeliveryUnitId { get; set; }
    public int? FiscalYear { get; set; }
    public string? Status { get; set; }
}
