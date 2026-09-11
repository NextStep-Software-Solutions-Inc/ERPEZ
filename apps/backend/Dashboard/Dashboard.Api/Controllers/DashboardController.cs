using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Authorization;
using ERPEZ.Application.Features.Dashboard.Dtos;
using ERPEZ.Application.Features.Dashboard.Queries.GetDashboardTasks;
using ERPEZ.Application.Features.Dashboard.Queries.GetOfficeDashboard;
using ERPEZ.Application.Features.Dashboard.Queries.GetPlanningDashboard;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

/// <summary>
/// Controller for dashboard overview and smart task cards.
/// </summary>
[Route("dashboard")]
[ApiController]
[Authorize]
public class DashboardController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Gets the Planning Dashboard overview for Planning users (global view).
    /// </summary>
    /// <param name="fiscalYearId">Fiscal year ID to filter dashboard data.</param>
    /// <param name="organizationId">Optional organization structure ID for filtering.</param>
    /// <returns>Dashboard overview with all key statistics.</returns>
    [HttpGet("planning")]
    [ProducesResponseType(typeof(ApiResponse<DashboardOverviewResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<DashboardOverviewResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<DashboardOverviewResponse>), StatusCodes.Status401Unauthorized)]
    [HasPermission(Permissions.Planning.viewGlobalDashboard)]
    public async Task<IActionResult> GetPlanningDashboard(
        [FromQuery] Guid fiscalYearId,
        [FromQuery] Guid? organizationId = null)
    {
        var query = new GetPlanningDashboardQuery
        {
            FiscalYearId = fiscalYearId,
            OrganizationId = organizationId
        };

        var result = await mediator.Send(query);

        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Gets the Office Dashboard overview for Office users (department-specific view).
    /// </summary>
    /// <param name="fiscalYearId">Fiscal year ID to filter dashboard data.</param>
    /// <param name="officeId">Optional office/department ID. If null, uses current user's office.</param>
    /// <returns>Dashboard overview filtered by office/department.</returns>
    [HttpGet("office")]
    [ProducesResponseType(typeof(ApiResponse<DashboardOverviewResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<DashboardOverviewResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<DashboardOverviewResponse>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<DashboardOverviewResponse>), StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Planning.viewGlobalDashboard)]
    public async Task<IActionResult> GetOfficeDashboard(
        [FromQuery] Guid fiscalYearId,
        [FromQuery] Guid? officeId = null)
    {
        var query = new GetOfficeDashboardQuery
        {
            FiscalYearId = fiscalYearId,
            OfficeId = officeId
        };

        var result = await mediator.Send(query);

        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Gets smart task cards for the current user with embedded dashboard statistics.
    /// </summary>
    /// <param name="fiscalYearId">Fiscal year ID to filter tasks.</param>
    /// <param name="taskType">Optional filter by task type (OPCR, WFP, Budget, Strategy, Procurement).</param>
    /// <param name="priority">Optional filter by priority (Low, Medium, High, Critical).</param>
    /// <param name="status">Optional filter by task status.</param>
    /// <param name="maxTasks">Maximum number of tasks to return (default: 50).</param>
    /// <returns>List of smart task cards with contextual statistics.</returns>
    [HttpGet("tasks")]
    [ProducesResponseType(typeof(ApiResponse<List<SmartTaskCardResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<List<SmartTaskCardResponse>>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<List<SmartTaskCardResponse>>), StatusCodes.Status401Unauthorized)]
    [HasPermission(Permissions.Planning.viewGlobalDashboard)]
    public async Task<IActionResult> GetDashboardTasks(
        [FromQuery] Guid fiscalYearId,
        [FromQuery] TaskType? taskType = null,
        [FromQuery] TaskPriority? priority = null,
        [FromQuery] string? status = null,
        [FromQuery] int maxTasks = 50)
    {
        var query = new GetDashboardTasksQuery
        {
            FiscalYearId = fiscalYearId,
            TaskType = taskType,
            Priority = priority,
            Status = status,
            MaxTasks = maxTasks
        };

        var result = await mediator.Send(query);

        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Gets a unified dashboard that automatically determines if user is Planning or Office user.
    /// </summary>
    /// <param name="fiscalYearId">Fiscal year ID to filter dashboard data.</param>
    /// <returns>Dashboard overview based on user role.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<DashboardOverviewResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<DashboardOverviewResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<DashboardOverviewResponse>), StatusCodes.Status401Unauthorized)]
    [HasPermission(Permissions.Planning.viewGlobalDashboard)]
    public async Task<IActionResult> GetDashboard([FromQuery] Guid fiscalYearId)
    {
        var principal = HttpContext?.User;
        var isAuthenticated = principal?.Identity?.IsAuthenticated ?? false;
        var isPlanningUser = principal?.IsInRole("PlanningUser") ?? false;
        var hasOfficeContext = !string.IsNullOrWhiteSpace(principal?.FindFirst("office_id")?.Value);

        // Fallback to planning dashboard when there is no office context
        // (e.g., anonymous testing or tokens without office claim).
        if (!isAuthenticated || isPlanningUser || !hasOfficeContext)
        {
            return await GetPlanningDashboard(fiscalYearId);
        }

        return await GetOfficeDashboard(fiscalYearId);
    }
}
