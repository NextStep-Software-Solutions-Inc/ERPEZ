using ERPEZ.Application.Features.Planning.ObjectExpenseClass.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ObjectExpenseClass.Queries.GetObjectExpenseClassById;

/// <summary>
/// Query to retrieve a single Object Expense Class mapping by its identifier.
/// </summary>
public record GetObjectExpenseClassByIdQuery(Guid Id) : IRequest<ApiResponse<ObjectExpenseClassResponse>>;
