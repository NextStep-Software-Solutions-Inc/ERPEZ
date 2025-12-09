namespace ERPEZ.Application.Features.Planning.OPCR.Dtos;

public record UpdateOPCRStatusRequest
{
    public required string Status { get; init; }
}