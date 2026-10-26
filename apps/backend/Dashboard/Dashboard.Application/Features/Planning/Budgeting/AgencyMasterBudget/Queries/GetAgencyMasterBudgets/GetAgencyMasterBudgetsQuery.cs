using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Queries.GetAgencyMasterBudgets;

public record GetAgencyMasterBudgetsQuery : PaginatedQuery<PaginatedApiResponse<AgencyMasterBudgetResponse>>;
