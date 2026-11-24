namespace ERPEZ.Application.Features.Planning.OPCRActivityMOV.Dtos;

public record UpdateOPCRActivityMOVRequest
{
    public Guid? FileId { get; init; }
}
