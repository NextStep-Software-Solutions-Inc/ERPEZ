using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Queries.GetLIBActivityObjects;

public record GetLIBActivityObjectsQuery(Guid LIBActivityId) : IRequest<ApiResponse<List<LIBActivityObjectResponse>>>;

    