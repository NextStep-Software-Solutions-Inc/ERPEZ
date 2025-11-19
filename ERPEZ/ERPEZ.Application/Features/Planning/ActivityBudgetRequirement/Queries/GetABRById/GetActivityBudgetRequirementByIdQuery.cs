using ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Queries.GetABRById;

public record class GetActivityBudgetRequirementByIdQuery(Guid Id) : IRequest<ApiResponse<ActivityBudgetRequirementResponse>>;
