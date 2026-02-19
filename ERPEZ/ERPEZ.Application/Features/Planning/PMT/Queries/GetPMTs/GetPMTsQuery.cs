using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.PMT.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.PMT.Queries.GetPMTs;

public record GetPMTsQuery : PaginatedQuery<PaginatedApiResponse<PMTResponse>>;
