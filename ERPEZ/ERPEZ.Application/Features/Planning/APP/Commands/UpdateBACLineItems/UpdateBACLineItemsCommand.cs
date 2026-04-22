using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Commands.UpdateBACLineItems;

public record UpdateBACLineItemsCommand : IRequest<ApiResponse<Unit>>
{
    public Guid AppId { get; init; }
    public List<UpdateBACLineItemRequest> LineItems { get; init; } = [];
}
