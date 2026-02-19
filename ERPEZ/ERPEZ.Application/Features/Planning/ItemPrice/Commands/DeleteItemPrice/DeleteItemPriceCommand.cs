using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ItemPrice.Commands.DeleteItemPrice;

public record DeleteItemPriceCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
