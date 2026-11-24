using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.FiscalYear.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Queries.GetFiscalYears;

public record GetFiscalYearsQuery : PaginatedQuery<PaginatedApiResponse<FiscalYearResponse>>
{
}
