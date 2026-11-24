using ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Commands.CreateAgencyMasterBudget;

public record CreateAgencyMasterBudgetCommand(CreateAgencyMasterBudgetRequest Request) : IRequest<ApiResponse<Guid>>;




