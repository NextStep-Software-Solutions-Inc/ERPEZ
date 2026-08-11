using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Procurement.AOBs.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Procurement.AOBs.Queries.GetAOBs;

public record GetAOBsQuery : PaginatedQuery<PaginatedApiResponse<AOBResponse>>;
