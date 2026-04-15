using ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Commands.UpdateAgencyMasterBudget;

public record UpdateAgencyMasterBudgetCommand(Guid Id, UpdateAgencyMasterBudgetRequest Request) : IRequest<ApiResponse<Unit>>;




