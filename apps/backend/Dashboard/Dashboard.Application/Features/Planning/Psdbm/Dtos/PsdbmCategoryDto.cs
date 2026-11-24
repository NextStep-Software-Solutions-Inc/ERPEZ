namespace ERPEZ.Application.Features.Planning.Psdbm.Dtos;

public record PsdbmCategoryDto
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public int ItemCount { get; init; }
}