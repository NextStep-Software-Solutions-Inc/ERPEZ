using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.FYActiveKPI.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Queries.GetFYActiveKPIs;

public record GetFYActiveKPIsQuery : PaginatedQuery<PaginatedApiResponse<FYActiveKPIResponse>>;
