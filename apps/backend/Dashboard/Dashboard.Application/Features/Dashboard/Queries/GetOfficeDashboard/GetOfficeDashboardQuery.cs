using ERPEZ.Application.Features.Dashboard.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Dashboard.Queries.GetOfficeDashboard;

/// <summary>
/// Query to get the Office Dashboard overview for Office users (department-specific view).
/// </summary>
public record GetOfficeDashboardQuery : IRequest<ApiResponse<DashboardOverviewResponse>>
{
    /// <summary>
    /// Fiscal year ID to filter dashboard data.
    /// </summary>
    public Guid FiscalYearId { get; init; }

    /// <summary>
    /// Office/Department ID to filter data for this specific office.
    /// If null, will use the current user's OfficeId from ICurrentUserService.
    /// </summary>
    public Guid? OfficeId { get; init; }
}
