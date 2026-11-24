using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ObjectExpenseClass.Commands.UpdateObjectExpenseClass;

/// <summary>
/// Command to update an existing Object Expense Class mapping.
/// </summary>
public record UpdateObjectExpenseClassCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public required Guid ObjectId { get; init; }
    public required Guid ExpenseClassId { get; init; }
    public required string Name { get; init; }
    public required string Description { get; init; }
    public required bool IsActive { get; init; }
}
