using ERPEZ.Application.Features.Planning.ExpenseClass.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ExpenseClass.Queries.GetExpenseClasses;

/// <summary>
/// Query to retrieve a paginated list of Expense Classes with optional filtering and sorting.
/// </summary>
public record GetExpenseClassesQuery : IRequest<PaginatedApiResponse<ExpenseClassResponse>>
{
    public string? Filters { get; init; }
    public string? Sorts { get; init; }
    public int? Page { get; init; }
    public int? PageSize { get; init; }
}
