using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.AdministrativeLevel.Commands.CreateAdministrativeLevel;

public record CreateAdministrativeLevelCommand : IRequest<ApiResponse<Guid>>
{
    public required string Name { get; init; }
    public required string Code { get; init; }
    public bool CanHaveChildren { get; init; }
}
