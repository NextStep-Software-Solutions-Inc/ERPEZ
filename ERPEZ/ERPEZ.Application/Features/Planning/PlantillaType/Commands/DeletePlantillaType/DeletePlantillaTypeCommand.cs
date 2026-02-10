using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PlantillaType.Commands.DeletePlantillaType;

public record DeletePlantillaTypeCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
