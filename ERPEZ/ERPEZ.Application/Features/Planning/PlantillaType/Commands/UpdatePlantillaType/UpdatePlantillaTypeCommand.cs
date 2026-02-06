using ERPEZ.Application.Features.Planning.PlantillaType.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PlantillaType.Commands.UpdatePlantillaType;

public record UpdatePlantillaTypeCommand : IRequest<ApiResponse<Unit>>
{
    public required Guid Id { get; init; }
    public required UpdatePlantillaTypeRequest Request { get; init; }
}
