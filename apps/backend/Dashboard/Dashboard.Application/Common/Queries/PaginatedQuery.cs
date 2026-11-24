using MediatR;

namespace ERPEZ.Application.Common.Queries;

public abstract record PaginatedQuery<TResponse> : IRequest<TResponse>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? Filters { get; init; }
    public string? Sorts { get; init; }
}
