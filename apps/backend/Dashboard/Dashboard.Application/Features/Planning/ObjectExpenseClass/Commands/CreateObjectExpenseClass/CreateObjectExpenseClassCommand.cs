using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ObjectExpenseClass.Commands.CreateObjectExpenseClass;

/// <summary>
/// Command to create a new Object Expense Class mapping.
/// </summary>
public record CreateObjectExpenseClassCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid ObjectId { get; init; }
    public required Guid ExpenseClassId { get; init; }
    public required string Name { get; init; }
    public required string Description { get; init; }
    public required bool IsActive { get; init; }
}
