using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.Transaction.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.Transaction.Queries.GetTransactions;

public record GetTransactionsQuery : PaginatedQuery<PaginatedApiResponse<TransactionResponse>>
{
}
