namespace ERPEZ.Application.Features.Planning.SDG.Dtos;

public class SDGResponse
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
}
