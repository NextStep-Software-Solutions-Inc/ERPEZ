using Microsoft.AspNetCore.Authorization;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Authorization;
using ERPEZ.Application.Features.Procurement.BiddingActivitySchedules.Commands.CreateBiddingActivitySchedule;
using ERPEZ.Application.Features.Procurement.BiddingActivitySchedules.Commands.DeleteBiddingActivitySchedule;
using ERPEZ.Application.Features.Procurement.BiddingActivitySchedules.Commands.UpdateBiddingActivitySchedule;
using ERPEZ.Application.Features.Procurement.Projects.Commands.CreateProcurementProject;
using ERPEZ.Application.Features.Procurement.Projects.Commands.DeleteProcurementProject;
using ERPEZ.Application.Features.Procurement.Projects.Commands.UpdateProcurementProject;
using ERPEZ.Application.Features.Procurement.Projects.Commands.AddConsolidatedPR;
using ERPEZ.Application.Features.Procurement.Projects.Dtos;
using ERPEZ.Application.Features.Procurement.Projects.Queries.GetCalendarEvents;
using ERPEZ.Application.Features.Procurement.Projects.Queries.GetCalendarEventsSummary;
using ERPEZ.Application.Features.Procurement.Projects.Queries.GetCalendarEventById;
using ERPEZ.Application.Features.Procurement.Projects.Queries.GetProcurementProjectById;
using ERPEZ.Application.Features.Procurement.Projects.Queries.GetProcurementProjects;
using ERPEZ.Application.Features.Procurement.Projects.Commands.UpdateProcurementProjectStatus;
using ERPEZ.Application.Features.Procurement.BiddingActivitySchedules.Commands.UpdateBiddingActivityScheduleStatus;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

using ERPEZ.Application.Features.Procurement.BiddingSchedules.Commands.ConfirmBiddingSchedule;
using ERPEZ.Application.Features.Procurement.BiddingSchedules.Commands.GenerateBiddingSchedule;
using ERPEZ.Application.Features.Procurement.BiddingSchedules.Commands.LockBiddingSchedule;
using ERPEZ.Application.Features.Procurement.BiddingSchedules.Commands.RegenerateBiddingSchedule;
using ERPEZ.Application.Features.Procurement.BiddingSchedules.Commands.SetMilestoneCompletion;
using ERPEZ.Application.Features.Procurement.BiddingSchedules.Commands.UpdateBiddingMilestone;
using ERPEZ.Application.Features.Procurement.BiddingSchedules.Dtos;
using ERPEZ.Application.Features.Procurement.BiddingSchedules.Queries.GetAllBiddingSchedules;
using ERPEZ.Application.Features.Procurement.BiddingSchedules.Queries.GetBiddingScheduleByResolutionId;

namespace ERPEZ.Api.Controllers;

public record GenerateScheduleApiRequest(string IbPostingDate, string ProcurementCategory, string? BacResolutionNumber = null, string? CreatedBy = null);
public record RegenerateScheduleApiRequest(string IbPostingDate, string ProcurementCategory, string? CreatedBy = null);
public record UpdateMilestoneApiRequest(string OverrideDate, string? Time, string Reason, string? EditedBy = null);
public record SetMilestoneCompletionApiRequest(bool Completed, string? UpdatedBy = null);
public record ConfirmScheduleApiRequest(string? ConfirmedBy = null);
public record LockScheduleApiRequest(string? LockedBy = null);

[Route("bac")]
[ApiController]
[Authorize]
public class BACProjectController(ISender mediator) : ControllerBase
{
    // ── Bidding Schedule & Master Calendar Endpoints ─────────────────────────

    [HttpPost("resolutions/{resolutionId}/schedule")]
    [ProducesResponseType(typeof(ApiResponse<BiddingScheduleResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GenerateSchedule(Guid resolutionId, [FromBody] GenerateScheduleApiRequest request)
    {
        var command = new GenerateBiddingScheduleCommand(
            resolutionId,
            request.BacResolutionNumber ?? string.Empty,
            request.IbPostingDate,
            request.ProcurementCategory,
            request.CreatedBy ?? "current-user"
        );
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("resolutions/{resolutionId}/schedule/regenerate")]
    [ProducesResponseType(typeof(ApiResponse<BiddingScheduleResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegenerateSchedule(Guid resolutionId, [FromBody] RegenerateScheduleApiRequest request)
    {
        var command = new RegenerateBiddingScheduleCommand(
            resolutionId,
            request.IbPostingDate,
            request.ProcurementCategory,
            request.CreatedBy ?? "current-user"
        );
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpGet("resolutions/{resolutionId}/schedule")]
    [ProducesResponseType(typeof(ApiResponse<BiddingScheduleResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetScheduleByResolutionId(Guid resolutionId)
    {
        var result = await mediator.Send(new GetBiddingScheduleByResolutionIdQuery(resolutionId));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPatch("schedules/{scheduleId}/milestones/{milestoneId}")]
    [ProducesResponseType(typeof(ApiResponse<BiddingScheduleResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateMilestone(Guid scheduleId, Guid milestoneId, [FromBody] UpdateMilestoneApiRequest request)
    {
        var command = new UpdateBiddingMilestoneCommand(
            scheduleId,
            milestoneId,
            request.OverrideDate,
            request.Time,
            request.Reason,
            request.EditedBy ?? "current-user"
        );
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPatch("schedules/{scheduleId}/milestones/{milestoneId}/complete")]
    [ProducesResponseType(typeof(ApiResponse<BiddingScheduleResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SetMilestoneCompletion(Guid scheduleId, Guid milestoneId, [FromBody] SetMilestoneCompletionApiRequest request)
    {
        var command = new SetMilestoneCompletionCommand(
            scheduleId,
            milestoneId,
            request.Completed,
            request.UpdatedBy ?? "current-user"
        );
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("schedules/{scheduleId}/confirm")]
    [ProducesResponseType(typeof(ApiResponse<BiddingScheduleResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ConfirmSchedule(Guid scheduleId, [FromBody] ConfirmScheduleApiRequest request)
    {
        var command = new ConfirmBiddingScheduleCommand(
            scheduleId,
            request.ConfirmedBy ?? "current-user"
        );
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("schedules/{scheduleId}/lock")]
    [ProducesResponseType(typeof(ApiResponse<BiddingScheduleResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> LockSchedule(Guid scheduleId, [FromBody] LockScheduleApiRequest request)
    {
        var command = new LockBiddingScheduleCommand(
            scheduleId,
            request.LockedBy ?? "current-user"
        );
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpGet("schedules")]
    [ProducesResponseType(typeof(ApiResponse<List<BiddingScheduleResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllSchedules()
    {
        var result = await mediator.Send(new GetAllBiddingSchedulesQuery());
        return Ok(result);
    }
    //[Authorize(Roles = "BAC_Officer")]
    [HttpPost("projects")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [HasPermission(Permissions.Procurement.bacManage)]
    public async Task<IActionResult> CreateProject([FromBody] CreateProcurementProjectCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetProjectById), new { id = result.Data }, result);
    }

    //[Authorize(Roles = "BAC_Officer")]
    [HttpGet("projects")]
    [ProducesResponseType(typeof(PaginatedApiResponse<ProcurementProjectResponse>), StatusCodes.Status200OK)]
    [HasPermission(Permissions.Procurement.bacManage)]
    public async Task<IActionResult> GetProjects([FromQuery] GetProcurementProjectsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    //[Authorize(Roles = "BAC_Officer")]
    [HttpGet("projects/{id}")]
    [ProducesResponseType(typeof(ApiResponse<ProcurementProjectDetailResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.bacManage)]
    public async Task<IActionResult> GetProjectById(Guid id)
    {
        var result = await mediator.Send(new GetProcurementProjectByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    //[Authorize(Roles = "BAC_Officer")]
    [HttpPut("projects/{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.bacManage)]
    public async Task<IActionResult> UpdateProject(Guid id, [FromBody] UpdateProcurementProjectRequest request)
    {
        var result = await mediator.Send(new UpdateProcurementProjectCommand { Id = id, UpdateRequest = request });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    //[Authorize(Roles = "BAC_Officer")]
    [HttpDelete("projects/{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.bacManage)]
    public async Task<IActionResult> DeleteProject(Guid id)
    {
        var result = await mediator.Send(new DeleteProcurementProjectCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    //[Authorize(Roles = "BAC_Officer")]
    [HttpPost("projects/{id}/consolidated-pr")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.bacManage)]
    public async Task<IActionResult> AddConsolidatedPR(Guid id, [FromBody] AddConsolidatedPRRequest request)
    {
        var result = await mediator.Send(new AddConsolidatedPRCommand { ProjectId = id, Request = request });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    //[Authorize(Roles = "BAC_Officer")]
    [HttpPost("projects/{id}/schedule")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.bacManage)]
    public async Task<IActionResult> CreateSchedule(Guid id, [FromBody] CreateBiddingActivityScheduleRequest request)
    {
        var result = await mediator.Send(new CreateBiddingActivityScheduleCommand { ProjectId = id, ScheduleRequest = request });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    //[Authorize(Roles = "BAC_Officer")]
    [HttpPut("projects/{projectId}/schedule/{scheduleId}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.bacManage)]
    public async Task<IActionResult> UpdateSchedule(Guid projectId, Guid scheduleId, [FromBody] UpdateBiddingActivityScheduleRequest request)
    {
        var result = await mediator.Send(new UpdateBiddingActivityScheduleCommand { ProjectId = projectId, ScheduleId = scheduleId, ScheduleRequest = request });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    //[Authorize(Roles = "BAC_Officer")]
    [HttpDelete("projects/{projectId}/schedule/{scheduleId}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.bacManage)]
    public async Task<IActionResult> DeleteSchedule(Guid projectId, Guid scheduleId)
    {
        var result = await mediator.Send(new DeleteBiddingActivityScheduleCommand(projectId, scheduleId));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    //[Authorize(Roles = "BAC_Officer")]
    [HttpPut("projects/{projectId}/schedule/{scheduleId}/status")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.bacManage)]
    public async Task<IActionResult> UpdateScheduleStatus(Guid projectId, Guid scheduleId, [FromBody] UpdateBiddingActivityScheduleStatusRequest request)
    {
        var result = await mediator.Send(new UpdateBiddingActivityScheduleStatusCommand { ProjectId = projectId, ScheduleId = scheduleId, StatusRequest = request });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    //[Authorize(Roles = "BAC_Officer")]
    [HttpPatch("projects/{id}/status")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.bacManage)]
    public async Task<IActionResult> UpdateProjectStatus(Guid id, [FromBody] UpdateProcurementProjectStatusRequest request)
    {
        var result = await mediator.Send(new UpdateProcurementProjectStatusCommand { Id = id, StatusRequest = request });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpGet("calendar-events")]
    [ProducesResponseType(typeof(ApiResponse<CalendarEventsWithSummaryResponse>), StatusCodes.Status200OK)]
    [HasPermission(Permissions.Procurement.bacManage)]
    public async Task<IActionResult> GetCalendarEvents([FromQuery] GetCalendarEventsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("calendar-events/summary")]
    [ProducesResponseType(typeof(ApiResponse<CalendarSummaryResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCalendarEventsSummary([FromQuery] GetCalendarEventsSummaryQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("calendar-events/{id}")]
    [ProducesResponseType(typeof(ApiResponse<CalendarEventResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.bacManage)]
    public async Task<IActionResult> GetCalendarEventById(Guid id)
    {
        var result = await mediator.Send(new GetCalendarEventByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    //[Authorize(Roles = "BAC_Officer")]
    [HttpPost("projects/{id}/approve")]
    [HttpPatch("projects/{id}/approve")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.bacManage)]
    public async Task<IActionResult> ApproveProject(Guid id, [FromBody] ERPEZ.Application.Features.Procurement.Projects.Commands.ApproveProcurementProject.ApproveProcurementProjectRequest request)
    {
        var result = await mediator.Send(new ERPEZ.Application.Features.Procurement.Projects.Commands.ApproveProcurementProject.ApproveProcurementProjectCommand 
        { 
            ProjectId = id, 
            Request = request 
        });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    //[Authorize(Roles = "BAC_Officer")]
    [HttpPost("projects/{id}/return")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ReturnProject(Guid id, [FromBody] ERPEZ.Application.Features.Procurement.Projects.Commands.ReturnProcurementProject.ReturnProcurementProjectRequest request)
    {
        var result = await mediator.Send(new ERPEZ.Application.Features.Procurement.Projects.Commands.ReturnProcurementProject.ReturnProcurementProjectCommand 
        { 
            ProjectId = id, 
            Request = request 
        });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Get supplier applications and documents for a procurement project
    /// </summary>
    [HttpGet("projects/{projectId}/applications")]
    [ProducesResponseType(typeof(ApiResponse<List<ERPEZ.Application.Features.Procurement.Projects.Queries.GetProjectSupplierApplications.ProjectSupplierApplicationDto>>), StatusCodes.Status200OK)]
    [HasPermission(Permissions.Procurement.bacManage)]
    public async Task<IActionResult> GetProjectApplications(Guid projectId)
    {
        var result = await mediator.Send(new ERPEZ.Application.Features.Procurement.Projects.Queries.GetProjectSupplierApplications.GetProjectSupplierApplicationsQuery(projectId));
        return Ok(result);
    }

    /// <summary>
    /// Evaluate a supplier application (Passed / Failed with remarks)
    /// </summary>
    [HttpPatch("projects/{projectId}/applications/{applicationId}/evaluation")]
    [ProducesResponseType(typeof(ApiResponse<ERPEZ.Application.Features.Procurement.Projects.Queries.GetProjectSupplierApplications.ProjectSupplierApplicationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.bacManage)]
    public async Task<IActionResult> EvaluateApplication(
        Guid projectId, 
        Guid applicationId, 
        [FromBody] ERPEZ.Application.Features.Procurement.Projects.Commands.EvaluateSupplierApplication.EvaluateSupplierApplicationRequest request)
    {
        var result = await mediator.Send(new ERPEZ.Application.Features.Procurement.Projects.Commands.EvaluateSupplierApplication.EvaluateSupplierApplicationCommand
        {
            ProjectId = projectId,
            ApplicationId = applicationId,
            Request = request
        });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}
