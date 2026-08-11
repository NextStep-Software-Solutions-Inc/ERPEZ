namespace ERPEZ.Application.Features.Planning.PPMP.Dtos;

public record ApprovalEventResponse
{
    public Guid Id { get; init; }
    public Guid PPMPId { get; init; }
    public string Role { get; init; } = string.Empty;
    public string Action { get; init; } = string.Empty;
    public Guid ActorId { get; init; }
    public string ActorName { get; init; } = string.Empty;
    public string? Notes { get; init; }
    public DateTime Timestamp { get; init; }
}
