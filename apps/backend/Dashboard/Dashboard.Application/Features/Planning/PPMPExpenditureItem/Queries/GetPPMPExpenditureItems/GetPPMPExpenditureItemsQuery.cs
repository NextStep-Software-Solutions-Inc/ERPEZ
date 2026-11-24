using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Queries.GetPPMPExpenditureItems;

public record GetPPMPExpenditureItemsQuery : PaginatedQuery<PaginatedApiResponse<PPMPExpenditureItemResponse>>;
