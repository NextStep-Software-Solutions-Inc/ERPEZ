using ERPEZ.Application.Features.Planning.AdministrativeLevel.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.AdministrativeLevel.Commands.UpdateAdministrativeLevel;

public record UpdateAdministrativeLevelCommand : IRequest<ApiResponse<Unit>>
{
    public required Guid Id { get; init; }
    public required UpdateAdministrativeLevelRequest UpdateAdministrativeLevel { get; init; }
}
