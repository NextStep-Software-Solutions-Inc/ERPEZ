using ERPEZ.Application.Features.Planning.APP.Commands.ChangeAPPStatus;
using ERPEZ.Application.Features.Planning.APP.Commands.CloneFinalAPP;
using ERPEZ.Application.Features.Planning.APP.Commands.CreateAPP;
using ERPEZ.Application.Features.Planning.APP.Commands.DeleteAPP;
using ERPEZ.Application.Features.Planning.APP.Commands.RemovePPMPs;
using ERPEZ.Application.Features.Planning.APP.Commands.SelectPPMPs;
using ERPEZ.Application.Features.Planning.APP.Commands.UpdateBACLineItems;
using ERPEZ.Application.Features.Planning.APP.Dtos;
using ERPEZ.Application.Features.Planning.APP.Queries.GetAPPBAC;
using ERPEZ.Application.Features.Planning.APP.Queries.GetAPPById;
using ERPEZ.Application.Features.Planning.APP.Queries.GetAPPs;
using ERPEZ.Application.Features.Planning.APP.Queries.GetAvailablePPMPItems;
using ERPEZ.Application.Features.Planning.PPMPItem.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Sieve.Models;

namespace ERPEZ.Api.Controllers;

/// <summary>
/// Manages Annual Procurement Plan (APP) operations
/// </summary>
[Route("apps")]
[ApiController]
public class APPController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Create a new Annual Procurement Plan (APP)
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateAPP([FromBody] CreateAPPCommand command)
    {
        var result = await mediator.Send(command);
        return CreatedAtAction(nameof(GetAPPById), new { id = result.Data }, result);
    }

    /// <summary>
    /// Get all APPs with filtering, sorting, and pagination
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<APPResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAPPs([FromQuery] SieveModel sieveModel)
    {
        var query = new GetAPPsQuery(sieveModel);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get APP by ID with all related data (items, PPMP selections, etc.)
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<APPResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<APPResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAPPById(Guid id)
    {
        var query = new GetAPPByIdQuery(id);
        var result = await mediator.Send(query);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Delete APP by ID
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAPP(Guid id)
    {
        var result = await mediator.Send(new DeleteAPPCommand(id));
        return result.Succeeded ? NoContent() : NotFound();
    }

    /// <summary>
    /// Select PPMPs for an APP
    /// </summary>
    [HttpPut("{id}/select-ppmps")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> SelectPPMPs(Guid id, [FromBody] SelectPPMPsRequest request)
    {
        var command = new SelectPPMPsCommand
        {
            APPId = id,
            PPMPIds = request.PPMPIds
        };

        var result = await mediator.Send(command);

        return Ok(result);
    }

    /// <summary>
    /// Remove PPMPs from an APP (unselect)
    /// </summary>
    [HttpPut("{id}/remove-ppmps")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemovePPMPs(Guid id, [FromBody] RemovePPMPsRequest request)
    {
        var command = new RemovePPMPsCommand
        {
            APPId = id,
            PPMPIds = request.PPMPIds
        };

        var result = await mediator.Send(command);

        return Ok(result);
    }

    /// <summary>
    /// Get Budget Allocation by Category (BAC) read-model for a specific APP
    /// </summary>
    [HttpGet("{id}/bac")]
    [ProducesResponseType(typeof(ApiResponse<BACResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<BACResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAPPBAC(Guid id)
    {
        var query = new GetAPPBACQuery(id);
        var result = await mediator.Send(query);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Update BAC line items (procurement mode, EPA eligibility, milestones)
    /// </summary>
    [HttpPut("{id}/bac/line-items")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateBACLineItems(Guid id, [FromBody] List<UpdateBACLineItemRequest> lineItems)
    {
        var command = new UpdateBACLineItemsCommand
        {
            AppId = id,
            LineItems = lineItems
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
    
    /// <summary>
    /// Get available PPMP items from PPMPs consolidated into this APP
    /// </summary>
    [HttpGet("{id}/available-ppmp-items")]
    [ProducesResponseType(typeof(ApiResponse<List<PPMPItemResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<List<PPMPItemResponse>>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAvailablePPMPItems(Guid id)
    {
        var query = new GetAvailablePPMPItemsQuery(id);
        var result = await mediator.Send(query);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPatch("{id}/status")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ChangeStatus(
        [FromRoute] Guid id,
        [FromBody] ChangeAPPStatusRequest request)  // ✅ body uses request DTO
    {
        var command = new ChangeAPPStatusCommand
        {
            Id = id,                    // ✅ from route
            Status = request.Status,    // ✅ from body
            Remarks = request.Remarks   // ✅ from body
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Clone an approved Final/Updated APP into a new Updated APP version
    /// </summary>
    [HttpPost("{id}/clone-updated")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CloneUpdated(
        [FromRoute] Guid id,
        [FromBody] ERPEZ.Application.Features.Planning.APP.Commands.CloneUpdatedAPP.CloneUpdatedAPPCommand command)
    {
        var result = await mediator.Send(command with { SourceAppId = id });
        return result.Succeeded
            ? CreatedAtAction(nameof(GetAPPById), new { id = result.Data }, result)
            : BadRequest(result);
    }

    /// <summary>
    /// Clone an approved Indicative APP into a new Final APP, carrying forward
    /// all PPMP sources and procurement items.
    /// </summary>
    [HttpPost("{id}/clone-final")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CloneFinal(
        [FromRoute] Guid id,
        [FromBody] CloneFinalAPPCommand command)
    {
        var result = await mediator.Send(command with { SourceAppId = id });
        return result.Succeeded
            ? CreatedAtAction(nameof(GetAPPById), new { id = result.Data }, result)
            : BadRequest(result);
    }

    /// <summary>
    /// Get APP Analytics and Summaries (breakdowns by office, category, fund source, procurement type)
    /// </summary>
    [HttpGet("{id}/analytics")]
    [ProducesResponseType(typeof(ApiResponse<APPAnalyticsResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<APPAnalyticsResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAnalytics(Guid id)
    {
        var query = new ERPEZ.Application.Features.Planning.APP.Queries.GetAPPAnalytics.GetAPPAnalyticsQuery(id);
        var result = await mediator.Send(query);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
