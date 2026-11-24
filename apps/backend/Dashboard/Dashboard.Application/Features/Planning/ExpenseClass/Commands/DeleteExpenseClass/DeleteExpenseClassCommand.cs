using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ExpenseClass.Commands.DeleteExpenseClass;

/// <summary>
/// Command to delete an Expense Class.
/// </summary>
public record DeleteExpenseClassCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
