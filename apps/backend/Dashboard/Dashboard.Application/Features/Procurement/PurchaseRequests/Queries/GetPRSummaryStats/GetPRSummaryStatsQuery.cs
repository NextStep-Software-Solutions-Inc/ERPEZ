using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetPRSummaryStats;

public record GetPRSummaryStatsQuery(
    Guid    OfficeId,
    PRType  PRType      // NonCSE or OutOfStockCSE — drives which tab's stats to return
) : IRequest<ApiResponse<PRSummaryStatsResponse>>;