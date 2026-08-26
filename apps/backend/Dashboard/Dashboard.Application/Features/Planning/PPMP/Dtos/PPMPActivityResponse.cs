namespace ERPEZ.Application.Features.Planning.PPMP.Dtos;

public record PPMPActivityResponse
{
    public Guid Id { get; init; }
    public Guid PPMPId { get; init; }
    public Guid LIBActivityId { get; init; }
    public string ActivityName { get; init; } = string.Empty;
    public string ActivityCode { get; init; } = string.Empty;
    public int TotalItems { get; init; }
    public int TotalItemAllocations { get; init; }
    public int TotalAllocationQuantity { get; init; }
    public decimal TotalAllocationAmount { get; init; }
    public DateTime CreatedAt { get; init; }
    /// <summary>MSF linked through PPMPActivity.LIBActivityId (activity-scope). Null if no MSF is associated.</summary>
    public MSFSummaryResponse? LinkedMarketScoping { get; init; }
    public List<PPMPExpenditureItemResponse> PPMPExpenditureItems { get; init; } = [];
}
