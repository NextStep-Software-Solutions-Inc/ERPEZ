using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.ExpenseClass.Dtos;

/// <summary>
/// Response DTO for ExpenseClass entity.
/// </summary>
public record ExpenseClassResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public ExpenseClassTypeEnum Type { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
}
