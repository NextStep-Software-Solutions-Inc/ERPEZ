using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.ApproveNoticeOfAward;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.CreateNoticeOfAward;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.DeleteNoticeOfAward;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.LogNoticeOfAwardMilestone;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.RecordNoticeOfAwardCascadeDecision;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.RecordNoticeOfAwardJustification;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.ReturnNoticeOfAward;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.SubmitNoticeOfAward;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.UpdateNoticeOfAward;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Dtos;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Queries.GetAvailableAwardBacResolutions;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Queries.GetNoticeOfAwardById;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Queries.GetNoticeOfAwards;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Queries.GetNoticeOfAwardSummary;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Queries.GetApprovedNoasAvailableForPO;
using ERPEZ.Application.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

/// <summary>
/// Manages Notice of Award (NOA) lifecycle, approvals, contract execution SLA tracking, and milestone logging.
/// </summary>
[Route("notice-of-awards")]
[ApiController]
public class NoticeOfAwardController(ISender mediator, ICurrentUserService currentUserService) : ControllerBase
{
    private (Guid actorId, string actorName) GetCurrentActor()
    {
        var idStr = currentUserService.UserId;
        var actorId = Guid.TryParse(idStr, out var parsed) ? parsed : Guid.Empty;
        var actorName = !string.IsNullOrWhiteSpace(currentUserService.Name)
            ? currentUserService.Name
            : (!string.IsNullOrWhiteSpace(currentUserService.Username) ? currentUserService.Username : "Procurement User");
        return (actorId, actorName);
    }

    /// <summary>
    /// Get paginated list of Notice of Award records with Sieve filtering, sorting, and SLA status
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<NoticeOfAwardListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNoticeOfAwards([FromQuery] GetNoticeOfAwardsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get approved Notice of Awards that are available for Purchase Order creation (not linked to an active PO)
    /// </summary>
    [HttpGet("available-for-po")]
    [ProducesResponseType(typeof(ApiResponse<List<AvailableNoaDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAvailableNoasForPO()
    {
        var result = await mediator.Send(new GetApprovedNoasAvailableForPOQuery());
        return Ok(result);
    }

    /// <summary>
    /// Get aggregate statistics and summary metrics for NOA workspace cards and SLA tracking
    /// </summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(ApiResponse<NoticeOfAwardSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary()
    {
        var result = await mediator.Send(new GetNoticeOfAwardSummaryQuery());
        return Ok(result);
    }

    /// <summary>
    /// Get approved Award Recommendation BAC Resolutions eligible for new NOA issuance
    /// </summary>
    [HttpGet("available-resolutions")]
    [ProducesResponseType(typeof(ApiResponse<List<AvailableAwardBacResolutionDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAvailableResolutions()
    {
        var result = await mediator.Send(new GetAvailableAwardBacResolutionsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Get single Notice of Award detail by ID including line items, SLA state, signed file, and workflow history
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<NoticeOfAwardDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await mediator.Send(new GetNoticeOfAwardByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Create a new Notice of Award in Draft status
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateNoticeOfAwardRequest request)
    {
        var (actorId, actorName) = GetCurrentActor();
        var command = new CreateNoticeOfAwardCommand(request, actorId, actorName);
        var result = await mediator.Send(command);
        return result.Succeeded
            ? CreatedAtAction(nameof(GetById), new { id = result.Data }, result)
            : BadRequest(result);
    }

    /// <summary>
    /// Update header details of a Draft or Returned Notice of Award
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateNoticeOfAwardRequest request)
    {
        var (actorId, actorName) = GetCurrentActor();
        var command = new UpdateNoticeOfAwardCommand(id, request, actorId, actorName);
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Submit a Draft or Returned Notice of Award to HoPE for approval
    /// </summary>
    [HttpPost("{id}/submit")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Submit(Guid id)
    {
        var (actorId, actorName) = GetCurrentActor();
        var command = new SubmitNoticeOfAwardCommand(id, actorId, actorName);
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Approve and issue Notice of Award as HoPE, commencing the 10-day contract execution SLA
    /// </summary>
    [HttpPost("{id}/approve")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Approve(Guid id, [FromBody] ApproveNoticeOfAwardRequest request)
    {
        var (actorId, actorName) = GetCurrentActor();
        var command = new ApproveNoticeOfAwardCommand(id, request, actorId, actorName);
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Return a Notice of Award to Procurement Staff for revision
    /// </summary>
    [HttpPost("{id}/return")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Return(Guid id, [FromBody] ReturnNoticeOfAwardRequest request)
    {
        var (actorId, actorName) = GetCurrentActor();
        var command = new ReturnNoticeOfAwardCommand(id, request, actorId, actorName);
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Log contract execution milestone (Conforme Received, Performance Security Posted, or Contract Executed)
    /// </summary>
    [HttpPost("{id}/milestones")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> LogMilestone(Guid id, [FromBody] LogNoticeOfAwardMilestoneRequest request)
    {
        var (actorId, actorName) = GetCurrentActor();
        var command = new LogNoticeOfAwardMilestoneCommand(id, request, actorId, actorName);
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Record justification explanation for delayed contract execution
    /// </summary>
    [HttpPost("{id}/justification")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RecordJustification(Guid id, [FromBody] RecordNoticeOfAwardJustificationRequest request)
    {
        var (actorId, actorName) = GetCurrentActor();
        var command = new RecordNoticeOfAwardJustificationCommand(id, request, actorId, actorName);
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Record cascade decision to refer forfeiture and next-ranked bidder evaluation to BAC
    /// </summary>
    [HttpPost("{id}/cascade-decision")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RecordCascadeDecision(Guid id, [FromBody] RecordNoticeOfAwardCascadeDecisionRequest request)
    {
        var (actorId, actorName) = GetCurrentActor();
        var command = new RecordNoticeOfAwardCascadeDecisionCommand(id, request, actorId, actorName);
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Delete a Draft Notice of Award
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var (actorId, actorName) = GetCurrentActor();
        var command = new DeleteNoticeOfAwardCommand(id, actorId, actorName);
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}
