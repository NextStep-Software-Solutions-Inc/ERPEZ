namespace ERPEZ.Application.Features.Planning.ProcurementMode.Dtos;

public record ProcurementModeResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public bool IsArchived { get; init; }
    public bool IsActive { get; init; }
    public ProcurementCategoryDto? ProcurementCategory { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

public record ProcurementCategoryDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
}
