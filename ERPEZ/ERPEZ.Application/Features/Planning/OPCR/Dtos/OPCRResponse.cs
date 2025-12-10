namespace ERPEZ.Application.Features.Planning.OPCR.Dtos;

public class OPCRResponse
{
    public Guid Id { get; set; }
    public Guid DeliveryUnitId { get; set; }
    public int FiscalYear { get; set; }
    public string Status { get; set; } = string.Empty;
}
