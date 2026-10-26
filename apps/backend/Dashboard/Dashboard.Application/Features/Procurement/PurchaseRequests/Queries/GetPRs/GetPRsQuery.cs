using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetPRs;

public record GetPRsQuery : PaginatedQuery<PaginatedApiResponse<PurchaseRequestSummaryResponse>>;