namespace ERPEZ.Application.Features.Planning.DUAllocation.Dtos;

public class DUAllocationDto
{
    public Guid Id { get; set; }
    public Guid ReceivedFundId { get; set; }
    public Guid DeliveryUnitId { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}
