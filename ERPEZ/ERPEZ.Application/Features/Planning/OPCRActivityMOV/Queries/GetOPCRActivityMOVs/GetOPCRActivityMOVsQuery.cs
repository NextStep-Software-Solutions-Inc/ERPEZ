using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.OPCRActivityMOV.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.OPCRActivityMOV.Queries.GetOPCRActivityMOVs;

public record GetOPCRActivityMOVsQuery : PaginatedQuery<PaginatedApiResponse<OPCRActivityMOVResponse>>
{
}
