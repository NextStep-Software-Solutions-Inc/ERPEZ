using ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Queries.GetABRById;

public record GetActivityBudgetRequirementByIdQuery(Guid Id) : IRequest<ApiResponse<ActivityBudgetRequirementResponse>>;
