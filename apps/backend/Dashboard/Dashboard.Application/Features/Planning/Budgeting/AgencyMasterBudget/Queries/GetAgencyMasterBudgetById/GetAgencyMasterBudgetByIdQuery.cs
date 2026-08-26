using ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Queries.GetAgencyMasterBudgetById;

public record GetAgencyMasterBudgetByIdQuery(Guid Id) : IRequest<ApiResponse<AgencyMasterBudgetResponse>>;
