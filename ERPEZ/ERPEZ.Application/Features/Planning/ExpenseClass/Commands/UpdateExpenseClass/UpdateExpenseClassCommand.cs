using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ExpenseClass.Commands.UpdateExpenseClass;

/// <summary>
/// Command to update an existing Expense Class.
/// </summary>
public record UpdateExpenseClassCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Code { get; init; }
    public required string Description { get; init; }
    public required ExpenseClassTypeEnum Type { get; init; }
    public required bool IsActive { get; init; }
}
