using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Commands.DeleteAgencyMasterBudget;

public record DeleteAgencyMasterBudgetCommand(Guid Id) : IRequest<ApiResponse<Unit>>;




