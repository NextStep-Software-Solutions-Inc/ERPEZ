using ERPEZ.Application.Features.Planning.BudgetCall.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.BudgetCall.Queries.GetBudgetCallById;

public record GetBudgetCallByIdQuery(Guid Id) : IRequest<ApiResponse<BudgetCallDetailedResponse>>;
