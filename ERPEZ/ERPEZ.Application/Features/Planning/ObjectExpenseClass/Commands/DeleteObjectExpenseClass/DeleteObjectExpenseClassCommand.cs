using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ObjectExpenseClass.Commands.DeleteObjectExpenseClass;

/// <summary>
/// Command to delete an Object Expense Class mapping.
/// </summary>
public record DeleteObjectExpenseClassCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
