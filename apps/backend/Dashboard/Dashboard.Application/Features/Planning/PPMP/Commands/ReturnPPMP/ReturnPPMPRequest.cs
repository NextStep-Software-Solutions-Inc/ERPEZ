namespace ERPEZ.Application.Features.Planning.PPMP.Commands.ReturnPPMP;

public record ReturnPPMPRequest
{
    public string Remarks { get; init; } = string.Empty;
    public string? ActorName { get; init; }
    public string? Role { get; init; }
}
