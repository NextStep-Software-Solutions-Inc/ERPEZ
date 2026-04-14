using ERPEZ.Application.Features.Dashboard.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Dashboard.Queries.GetDashboardTasks;

/// <summary>
/// Query to get smart task cards for the current user with embedded dashboard statistics.
/// </summary>
public record GetDashboardTasksQuery : IRequest<ApiResponse<List<SmartTaskCardResponse>>>
{
    /// <summary>
    /// Fiscal year ID to filter tasks.
    /// </summary>
    public Guid FiscalYearId { get; init; }

    /// <summary>
    /// Optional filter by task type.
    /// </summary>
    public TaskType? TaskType { get; init; }

    /// <summary>
    /// Optional filter by task priority.
    /// </summary>
    public TaskPriority? Priority { get; init; }

    /// <summary>
    /// Optional filter by task status.
    /// </summary>
    public string? Status { get; init; }

    /// <summary>
    /// Maximum number of tasks to return (default: 50).
    /// </summary>
    public int MaxTasks { get; init; } = 50;
}
