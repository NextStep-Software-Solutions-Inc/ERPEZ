using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.FiscalMonth.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.FiscalMonth.Queries.GetFiscalMonths;

public record GetFiscalMonthsQuery : PaginatedQuery<PaginatedApiResponse<FiscalMonthResponse>>
{
}
