namespace ERPEZ.Application.Features.Planning.OPCR.Dtos;

public record UpdateOPCRRequest
{
    public string? Name { get; init; }
    public string? Code { get; init; }
}
