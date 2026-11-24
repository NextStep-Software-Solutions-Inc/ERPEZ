namespace ERPEZ.Application.Features.Planning.UOM.Dtos;

public record UOMResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public string? Description { get; init; }
    public decimal? ConversionFactor { get; init; }
    public bool IsActive { get; init; }
    public Guid? ParentId { get; init; }
    public string? ParentName { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
