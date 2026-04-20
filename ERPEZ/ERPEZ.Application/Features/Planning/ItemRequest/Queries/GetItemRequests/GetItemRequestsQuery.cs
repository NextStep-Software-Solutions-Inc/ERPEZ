using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.ItemRequest.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.ItemRequest.Queries.GetItemRequests;

public record GetItemRequestsQuery : PaginatedQuery<PaginatedApiResponse<ItemRequestResponse>>;
