namespace ERPEZ.Application.Features.Planning.PPMPActivity.Dtos;

public record PPMPActivityResponse
{
    public Guid Id { get; init; }
    public Guid PPMPId { get; init; }
    public Guid LIBActivityId { get; init; }
    public string ActivityName { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
}
