using ERPEZ.Application.Features.Planning.PlantillaType.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PlantillaType.Queries.GetPlantillaTypeById;

public record GetPlantillaTypeByIdQuery(Guid Id) : IRequest<ApiResponse<PlantillaTypeResponse>>;
