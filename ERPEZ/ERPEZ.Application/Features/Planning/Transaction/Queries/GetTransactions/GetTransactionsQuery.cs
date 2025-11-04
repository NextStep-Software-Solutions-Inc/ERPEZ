using ERPEZ.Application.Features.Planning.Transaction.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Transaction.Queries.GetTransactions;

public class GetTransactionsQuery : IRequest<PaginatedApiResponse<TransactionDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Filters { get; set; }
    public string? Sorts { get; set; }
}