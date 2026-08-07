using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.PlantillaType.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.PlantillaType.Queries.GetPlantillaTypes;

public record GetPlantillaTypesQuery : PaginatedQuery<PaginatedApiResponse<PlantillaTypeResponse>>;
