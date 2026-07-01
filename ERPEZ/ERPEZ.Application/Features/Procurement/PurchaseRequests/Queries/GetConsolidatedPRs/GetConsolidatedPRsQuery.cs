using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetConsolidatedPRs;

public record GetConsolidatedPRsQuery : PaginatedQuery<PaginatedApiResponse<ConsolidatedPRSummaryResponse>>;