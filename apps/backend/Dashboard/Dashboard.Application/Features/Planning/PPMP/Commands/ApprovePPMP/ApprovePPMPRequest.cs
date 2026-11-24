namespace ERPEZ.Application.Features.Planning.PPMP.Commands.ApprovePPMP;

public record ApprovePPMPRequest
{
    public string? ActorName { get; init; }
    public string? Role { get; init; }
    public string? Notes { get; init; }
}
