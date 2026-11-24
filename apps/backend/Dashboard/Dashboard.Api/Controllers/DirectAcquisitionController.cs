using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.DirectAcquisitions.Commands.ApproveDirectAcquisition;
using ERPEZ.Application.Features.Procurement.DirectAcquisitions.Commands.ChangeDirectAcquisitionStatus;
using ERPEZ.Application.Features.Procurement.DirectAcquisitions.Commands.CreateDirectAcquisition;
using ERPEZ.Application.Features.Procurement.DirectAcquisitions.Commands.DeleteDirectAcquisition;
using ERPEZ.Application.Features.Procurement.DirectAcquisitions.Commands.RecordDirectPurchase;
using ERPEZ.Application.Features.Procurement.DirectAcquisitions.Commands.ReturnDirectAcquisition;
using ERPEZ.Application.Features.Procurement.DirectAcquisitions.Dtos;
using ERPEZ.Application.Features.Procurement.DirectAcquisitions.Queries.GetDirectAcquisitionById;
using ERPEZ.Application.Features.Procurement.DirectAcquisitions.Queries.GetDirectAcquisitions;
using ERPEZ.Application.Features.Procurement.DirectAcquisitions.Queries.GetDirectAcquisitionSummary;
using ERPEZ.Application.Features.Procurement.DirectAcquisitions.Queries.GetApprovedDaResolutionsAvailableForPO;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("direct-acquisitions")]
[ApiController]
public class DirectAcquisitionController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Get summary count of Direct Acquisitions grouped by status.
    /// </summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(ApiResponse<DirectAcquisitionSummaryResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetDirectAcquisitionSummaryQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get paginated list of Direct Acquisitions with filtering and sorting.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<DirectAcquisitionResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDirectAcquisitions([FromQuery] GetDirectAcquisitionsQuery query, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get approved Direct Acquisitions that are available for Purchase Order creation (not linked to an active PO)
    /// </summary>
    [HttpGet("available-for-po")]
    [ProducesResponseType(typeof(ApiResponse<List<AvailableDaResolutionDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAvailableDirectAcquisitionsForPO(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetApprovedDaResolutionsAvailableForPOQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Get Direct Acquisition by ID with linked CPR, derived CPR items, recorded purchase entry, and proof documents.
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<DirectAcquisitionResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDirectAcquisitionById(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetDirectAcquisitionByIdQuery(id), cancellationToken);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Create a new Direct Acquisition draft linked to a Consolidated PR.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateDirectAcquisition([FromBody] CreateDirectAcquisitionRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new CreateDirectAcquisitionCommand { Request = request }, cancellationToken);
        return !result.Succeeded
            ? BadRequest(result)
            : CreatedAtAction(nameof(GetDirectAcquisitionById), new { id = result.Data }, result);
    }

    /// <summary>
    /// Record direct purchase details, vendor/reimbursement info, and proof documents.
    /// </summary>
    [HttpPost("{id}/purchase-entry")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RecordPurchaseEntry(Guid id, [FromBody] RecordDirectPurchaseRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new RecordDirectPurchaseCommand
        {
            DirectAcquisitionId = id,
            Request = request
        }, cancellationToken);

        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Approve Direct Acquisition and attach physically signed approval document.
    /// </summary>
    [HttpPost("{id}/approve")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Approve(Guid id, [FromBody] ApproveDirectAcquisitionRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new ApproveDirectAcquisitionCommand
        {
            DirectAcquisitionId = id,
            Request = request
        }, cancellationToken);

        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Return Direct Acquisition for correction with remarks.
    /// </summary>
    [HttpPost("{id}/return")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Return(Guid id, [FromBody] ReturnDirectAcquisitionRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new ReturnDirectAcquisitionCommand
        {
            DirectAcquisitionId = id,
            Request = request
        }, cancellationToken);

        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Update Direct Acquisition status (e.g. mark for disbursement).
    /// </summary>
    [HttpPatch("{id}/status")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ChangeStatus(Guid id, [FromBody] ChangeDirectAcquisitionStatusRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new ChangeDirectAcquisitionStatusCommand
        {
            DirectAcquisitionId = id,
            Status = request.Status
        }, cancellationToken);

        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Delete / Soft-delete a Direct Acquisition record.
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DeleteDirectAcquisitionCommand(id), cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}
