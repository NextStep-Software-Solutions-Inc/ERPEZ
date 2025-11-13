using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Commands.DeleteABR;

public record class DeleteActivityBudgetRequirementCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
