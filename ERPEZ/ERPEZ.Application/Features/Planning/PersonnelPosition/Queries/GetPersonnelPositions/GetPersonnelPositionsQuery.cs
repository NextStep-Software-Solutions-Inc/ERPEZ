using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.PersonnelPosition.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.PersonnelPosition.Queries.GetPersonnelPositions;

public record GetPersonnelPositionsQuery : PaginatedQuery<PaginatedApiResponse<PersonnelPositionResponse>>;
