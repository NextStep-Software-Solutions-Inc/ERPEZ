using ERPEZ.Application.Features.Planning.OPCRItem.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItem.Commands.UpdateOPCRItem;

public record UpdateOPCRItemCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public required UpdateOPCRItemRequest UpdateOPCRItem { get; init; }
}
