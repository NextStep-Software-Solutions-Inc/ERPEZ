namespace ERPEZ.Application.Features.Planning.SDG.Commands.UpdateSDG;

public record UpdateSDGRequest
{
    public string? Name { get; init; }
    public string? Description { get; init; }
}
