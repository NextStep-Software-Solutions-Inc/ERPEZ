using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Queries.GetFiscalYears;

public class GetFiscalYearsQuery : IRequest<PaginatedApiResponse<ERPEZ.Application.Features.Planning.FiscalYear.Dtos.FiscalYearResponse>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Filters { get; set; }
    public string? Sorts { get; set; }
}
