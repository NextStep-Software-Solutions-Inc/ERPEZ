namespace ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Dtos;

public record UpdatePPMPExpenditureItemRequest
{
    public Guid? PPMPActivityId { get; init; }
    public Guid? ObjectId { get; init; }
    public bool? IsProcurable { get; init; }
    public decimal? TotalCost { get; init; }
}
