namespace ERPEZ.Application.Features.Planning.ProcurementCategory.Dtos;

public record ProcurementCategoryResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
