using ERPEZ.Application.Features.Planning.ExpenseClass.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ExpenseClass.Queries.GetExpenseClassById;

/// <summary>
/// Query to retrieve a single Expense Class by its identifier.
/// </summary>
public record GetExpenseClassByIdQuery(Guid Id) : IRequest<ApiResponse<ExpenseClassResponse>>;
