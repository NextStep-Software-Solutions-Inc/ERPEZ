using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PlantillaType.Commands.CreatePlantillaType;

public record CreatePlantillaTypeCommand : IRequest<ApiResponse<Guid>>
{
    public required string Name { get; init; }
    public required string Code { get; init; }
    public int? Duration { get; init; }
    public bool RequiresActingAppointments { get; init; }
    public bool AllowsContractual { get; init; }
    public string? Benefits { get; init; }
}
