using ERPEZ.Application.Features.Planning.ItemPrice.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ItemPrice.Queries.GetItemPriceById;

public record GetItemPriceByIdQuery(Guid Id) : IRequest<ApiResponse<ItemPriceDetailedResponse>>;
