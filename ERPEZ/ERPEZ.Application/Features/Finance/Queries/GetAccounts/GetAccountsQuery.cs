using ERPEZ.Application.Common.Queries;
using ERPEZ.Domain.Dtos.Finance;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Finance.Queries.GetAccounts;

public record GetAccountsQuery : PaginatedQuery<PaginatedApiResponse<AccountResponse>>
{
}
