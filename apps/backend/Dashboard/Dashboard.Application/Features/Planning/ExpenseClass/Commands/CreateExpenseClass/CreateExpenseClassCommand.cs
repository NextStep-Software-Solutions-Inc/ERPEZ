using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ExpenseClass.Commands.CreateExpenseClass;

/// <summary>
/// Command to create a new Expense Class.
/// </summary>
public record CreateExpenseClassCommand : IRequest<ApiResponse<Guid>>
{
    public required string Name { get; init; }
    public required string Code { get; init; }
    public required string Description { get; init; }
    public required ExpenseClassTypeEnum Type { get; init; }
    public required bool IsActive { get; init; }
}
