using ERPEZ.Application.Features.Planning.ItemRequest.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.ItemRequest.Queries.GetItemRequests;

public record GetItemRequestsQuery(SieveModel SieveModel) : IRequest<PaginatedApiResponse<ItemRequestResponse>>;
