using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.ExpenseClass.Dtos;

/// <summary>
/// Request DTO for updating an ExpenseClass.
/// </summary>
public record UpdateExpenseClassRequest
{
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public ExpenseClassTypeEnum Type { get; init; }
    public bool IsActive { get; init; }
}
