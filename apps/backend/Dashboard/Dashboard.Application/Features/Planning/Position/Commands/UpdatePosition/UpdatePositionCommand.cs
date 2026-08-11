using ERPEZ.Application.Features.Planning.Position.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Position.Commands.UpdatePosition;

public record UpdatePositionCommand : IRequest<ApiResponse<Unit>>
{
    public required Guid Id { get; init; }
    public required UpdatePositionRequest UpdatePosition { get; init; }
}
