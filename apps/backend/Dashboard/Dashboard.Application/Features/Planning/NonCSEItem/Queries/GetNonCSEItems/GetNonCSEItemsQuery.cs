using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.NonCSEItem.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.NonCSEItem.Queries.GetNonCSEItems;

public record GetNonCSEItemsQuery : PaginatedQuery<PaginatedApiResponse<NonCSEItemResponse>>;
