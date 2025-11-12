using ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Commands.UpdateABR;

public class UpdateActivityBudgetRequirementCommand : IRequest<ApiResponse<ActivityBudgetRequirementResponse>>
{
    public Guid Id { get; set; }
    public required UpdateActivityBudgetRequirementRequest UpdateActivityBudgetRequirement { get; set; }
}

