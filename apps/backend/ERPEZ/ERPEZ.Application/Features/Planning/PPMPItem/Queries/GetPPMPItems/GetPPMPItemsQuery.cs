using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.PPMPItem.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.PPMPItem.Queries.GetPPMPItems;

public record GetPPMPItemsQuery : PaginatedQuery<PaginatedApiResponse<PPMPItemResponse>>;
