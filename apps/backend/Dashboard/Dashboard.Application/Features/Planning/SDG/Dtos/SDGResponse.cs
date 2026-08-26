namespace ERPEZ.Application.Features.Planning.SDG.Dtos;

public record SDGResponse
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public required string SdgCode { get; set; }   // ← add
}
