using ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Commands.UpdateAgencyMasterBudget;

public record UpdateAgencyMasterBudgetCommand(Guid Id, UpdateAgencyMasterBudgetRequest Request) : IRequest<ApiResponse<Unit>>;




