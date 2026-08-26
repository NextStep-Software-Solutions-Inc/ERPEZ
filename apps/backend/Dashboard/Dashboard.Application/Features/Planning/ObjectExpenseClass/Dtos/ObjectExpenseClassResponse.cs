namespace ERPEZ.Application.Features.Planning.ObjectExpenseClass.Dtos;

/// <summary>
/// Response DTO for ObjectExpenseClass entity.
/// </summary>
public record ObjectExpenseClassResponse
{
    public Guid Id { get; init; }
    public Guid ObjectId { get; init; }
    public Guid ExpenseClassId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
}
