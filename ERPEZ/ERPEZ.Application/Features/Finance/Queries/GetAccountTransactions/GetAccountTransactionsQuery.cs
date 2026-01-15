using ERPEZ.Application.Common.Queries;
using ERPEZ.Domain.Dtos.Finance;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Finance.Queries.GetAccountTransactions;

public record GetAccountTransactionsQuery : PaginatedQuery<PaginatedApiResponse<AccountTransactionResponse>>
{
}
