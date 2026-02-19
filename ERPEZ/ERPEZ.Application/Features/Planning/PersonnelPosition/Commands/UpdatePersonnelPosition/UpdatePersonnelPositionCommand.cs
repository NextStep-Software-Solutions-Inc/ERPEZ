using ERPEZ.Application.Features.Planning.PersonnelPosition.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PersonnelPosition.Commands.UpdatePersonnelPosition;

public record UpdatePersonnelPositionCommand : IRequest<ApiResponse<Unit>>
{
    public required Guid Id { get; init; }
    public required UpdatePersonnelPositionRequest UpdatePersonnelPosition { get; init; }
}
