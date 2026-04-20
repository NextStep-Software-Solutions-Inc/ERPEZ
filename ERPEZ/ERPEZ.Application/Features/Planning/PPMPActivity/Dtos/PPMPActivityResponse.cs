namespace ERPEZ.Application.Features.Planning.PPMPActivity.Dtos;

public record PPMPActivityResponse
{
    public Guid Id { get; init; }
    public Guid PPMPId { get; init; }
    public Guid LIBActivityId { get; init; }
    public string ActivityName { get; init; } = string.Empty;
    public int TotalItems { get; init; }
    public int TotalItemAllocations { get; init; }
    public int TotalAllocationQuantity { get; init; }
    public decimal TotalAllocationAmount { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
}
