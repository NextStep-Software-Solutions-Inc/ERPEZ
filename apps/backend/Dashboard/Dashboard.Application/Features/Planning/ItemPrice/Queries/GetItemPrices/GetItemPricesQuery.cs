using ERPEZ.Application.Features.Planning.ItemPrice.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.ItemPrice.Queries.GetItemPrices;

public record GetItemPricesQuery(SieveModel SieveModel) : IRequest<PaginatedApiResponse<ItemPriceResponse>>;
