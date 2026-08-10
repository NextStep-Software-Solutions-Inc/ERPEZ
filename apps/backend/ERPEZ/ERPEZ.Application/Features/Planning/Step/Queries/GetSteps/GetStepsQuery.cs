using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.Step.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.Step.Queries.GetSteps;

public record GetStepsQuery : PaginatedQuery<PaginatedApiResponse<StepResponse>>
{
}
