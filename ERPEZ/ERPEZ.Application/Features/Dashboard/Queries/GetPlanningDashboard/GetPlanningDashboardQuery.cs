using ERPEZ.Application.Features.Dashboard.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Dashboard.Queries.GetPlanningDashboard;

/// <summary>
/// Query to get the Planning Dashboard overview for Planning users (global view).
/// </summary>
public record GetPlanningDashboardQuery : IRequest<ApiResponse<DashboardOverviewResponse>>
{
    /// <summary>
    /// Fiscal year ID to filter dashboard data.
    /// </summary>
    public Guid FiscalYearId { get; init; }

    /// <summary>
    /// Optional organization structure ID for filtering.
    /// </summary>
    public Guid? OrganizationId { get; init; }
}
