using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.NonCSEItem.Commands.UpdateNonCSEItemStatus;

public record UpdateNonCSEItemStatusCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public bool IsActive { get; init; }
}
