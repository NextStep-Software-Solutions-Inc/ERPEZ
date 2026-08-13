using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.AdministrativeLevel.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.AdministrativeLevel.Queries.GetAdministrativeLevels;

public record GetAdministrativeLevelsQuery : PaginatedQuery<PaginatedApiResponse<AdministrativeLevelResponse>>;
