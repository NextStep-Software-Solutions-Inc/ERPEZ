namespace ERPEZ.Application.Features.Planning.ObjectExpenseClass.Dtos;

/// <summary>
/// Request DTO for updating an ObjectExpenseClass.
/// </summary>
public record UpdateObjectExpenseClassRequest
{
    public Guid ObjectId { get; init; }
    public Guid ExpenseClassId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public bool IsActive { get; init; }
}
