using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.KPI.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.KPI.Queries.GetKPIsQuery;

public record GetKPIsQuery : PaginatedQuery<PaginatedApiResponse<KPIResponse>>
{
	public Guid? TargetFiscalYearId { get; init; }
	public Guid? SourceFiscalYearId { get; init; }
}
