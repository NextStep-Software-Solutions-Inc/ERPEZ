using ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Queries.GetAgencyMasterBudgets;

public record GetAgencyMasterBudgetsQuery : IRequest<ApiResponse<List<AgencyMasterBudgetResponse>>>;
