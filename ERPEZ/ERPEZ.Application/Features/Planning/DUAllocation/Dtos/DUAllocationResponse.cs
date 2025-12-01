namespace ERPEZ.Application.Features.Planning.DUAllocation.Dtos;

public class DUAllocationResponse
{
    public Guid Id { get; set; }
    public Guid DeliveryUnitId { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public bool IsLocked { get; set; }
    public DateTime CreatedAt { get; set; }
}
