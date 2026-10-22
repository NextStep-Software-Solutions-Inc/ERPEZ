using System;
using ERPEZ.Application.Features.Procurement.Dashboard.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Dashboard.Queries.GetBudgetBurnAnalytics;

public record GetBudgetBurnAnalyticsQuery : IRequest<ApiResponse<BudgetBurnAnalyticsDto>>
{
    public int FiscalYear { get; init; }
    public Guid? OfficeId { get; init; }
}
