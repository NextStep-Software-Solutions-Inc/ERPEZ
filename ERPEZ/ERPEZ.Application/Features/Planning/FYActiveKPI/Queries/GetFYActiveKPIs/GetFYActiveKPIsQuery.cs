using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.FYActiveKPI.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Queries.GetFYActiveKPIs;

public record GetFYActiveKPIsQuery : PaginatedQuery<PaginatedApiResponse<FYActiveKPIResponse>>
{
    /// <summary>
    /// When provided, returns only FYActiveKPIs that have NOT yet been assigned or shopped by this office.
    /// Use this to build the "KPIs available to shop" list for a specific office.
    /// </summary>
    public Guid? AvailableForOfficeId { get; init; }
}
