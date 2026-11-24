using ERPEZ.Application.Features.Planning.PositionType.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PositionType.Commands.UpdatePositionType;

public record UpdatePositionTypeCommand : IRequest<ApiResponse<Unit>>
{
    public required Guid Id { get; init; }
    public required UpdatePositionTypeRequest UpdatePositionType { get; init; }
}
