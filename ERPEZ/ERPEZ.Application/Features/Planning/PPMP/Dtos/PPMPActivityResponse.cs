namespace ERPEZ.Application.Features.Planning.PPMP.Dtos;

public record PPMPActivityResponse
{
    public Guid Id { get; init; }
    public Guid PPMPId { get; init; }
    public Guid LIBActivityId { get; init; }
    public string ActivityName { get; init; } = string.Empty;
    public string ActivityCode { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public List<PPMPExpenditureItemResponse> PPMPExpenditureItems { get; init; } = [];
}
