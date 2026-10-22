using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.UACSCodeCombination.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.UACSCodeCombination.Queries.GetUACSCodeCombinations;

public record GetUACSCodeCombinationsQuery : PaginatedQuery<PaginatedApiResponse<UACSCodeCombinationResponse>>
{
}
