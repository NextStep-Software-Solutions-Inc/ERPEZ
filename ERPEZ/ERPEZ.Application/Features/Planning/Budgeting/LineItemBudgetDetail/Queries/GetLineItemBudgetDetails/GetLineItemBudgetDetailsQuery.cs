using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Queries.GetLineItemBudgetDetails;

public record GetLineItemBudgetDetailsQuery : PaginatedQuery<PaginatedApiResponse<LineItemBudgetDetailResponse>>;

