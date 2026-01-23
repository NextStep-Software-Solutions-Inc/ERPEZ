using ERPEZ.Application.Features.Planning.ObjectExpenseClass.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ObjectExpenseClass.Queries.GetObjectExpenseClasses;

/// <summary>
/// Query to retrieve a paginated list of Object Expense Class mappings with optional filtering and sorting.
/// </summary>
public record GetObjectExpenseClassesQuery : IRequest<PaginatedApiResponse<ObjectExpenseClassResponse>>
{
    public string? Filters { get; init; }
    public string? Sorts { get; init; }
    public int? Page { get; init; }
    public int? PageSize { get; init; }
}
