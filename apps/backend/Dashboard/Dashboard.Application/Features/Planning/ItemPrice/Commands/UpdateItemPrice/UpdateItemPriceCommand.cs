using ERPEZ.Application.Features.Planning.ItemPrice.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ItemPrice.Commands.UpdateItemPrice;

public record UpdateItemPriceCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public required UpdateItemPriceRequest UpdateItemPrice { get; init; }
}
