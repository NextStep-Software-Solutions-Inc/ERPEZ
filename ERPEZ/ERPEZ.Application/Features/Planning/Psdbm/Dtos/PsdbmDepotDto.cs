namespace ERPEZ.Application.Features.Planning.Psdbm.Dtos;

public record PsdbmDepotDto
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public required string Region { get; init; }
}