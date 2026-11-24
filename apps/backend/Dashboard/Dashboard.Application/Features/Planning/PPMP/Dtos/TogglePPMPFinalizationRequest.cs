namespace ERPEZ.Application.Features.Planning.PPMP.Dtos;

public record TogglePPMPFinalizationRequest
{
    public bool IsFinal { get; init; }
}
