using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.ReceivedFund.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.ReceivedFund.Queries.GetReceivedFunds;

public record GetReceivedFundsQuery : PaginatedQuery<PaginatedApiResponse<ReceivedFundResponse>>
{
}
