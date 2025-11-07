using ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Commands.UpdateABR;

public class UpdateActivityBudgetRequirementCommand : IRequest<ApiResponse<ActivityBudgetRequirementDto>>
{
    public Guid Id { get; set; }
    public required UpdateActivityBudgetRequirementDto UpdateActivityBudgetRequirement { get; set; }
}

