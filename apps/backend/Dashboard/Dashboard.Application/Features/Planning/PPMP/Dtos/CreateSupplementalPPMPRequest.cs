namespace ERPEZ.Application.Features.Planning.PPMP.Dtos;

public record CreateSupplementalPPMPRequest
{
    public string? PPMPNumber { get; init; }
    public string? Description { get; init; }
    public bool CopyItems { get; init; } = false;
}
