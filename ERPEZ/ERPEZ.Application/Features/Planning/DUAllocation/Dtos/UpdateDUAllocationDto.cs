namespace ERPEZ.Application.Features.Planning.DUAllocation.Dtos;

public class UpdateDUAllocationDto
{
    public Guid? ReceivedFundId { get; set; }
    public Guid? DeliveryUnitId { get; set; }
    public string? Purpose { get; set; }
    public decimal? Amount { get; set; }
}
