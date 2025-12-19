using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Commands.DeleteABR;

public record DeleteActivityBudgetRequirementCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
