using ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.ConsolidatedPR;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.ConsolidatedPR.RemovePRFromConsolidated;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetConsolidatedPRById;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetConsolidatedPRs;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetEligiblePRsForCPR;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetConsolidatedPrItemsForRFQ;

using ERPEZ.Shared.Common;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("consolidated-prs")]
[ApiController]
public class ConsolidatedPRController(ISender mediator) : ControllerBase
{
    // ── CRUD ─────────────────────────────────────────────────────────────────

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateConsolidatedPR(
        [FromBody] CreateConsolidatedPRRequest dto,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new CreateConsolidatedPRCommand(dto), cancellationToken);
        return result.Succeeded
            ? CreatedAtAction(nameof(GetConsolidatedPRById), new { id = result.Data }, result)
            : BadRequest(result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<ConsolidatedPRSummaryResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetConsolidatedPRs(
        [FromQuery] GetConsolidatedPRsQuery query,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<ConsolidatedPRDetailResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetConsolidatedPRById(
        Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new GetConsolidatedPRByIdQuery(id), cancellationToken);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    // ── PR management within CPR ─────────────────────────────────────────────

    [HttpPost("{id}/prs")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddPRsToConsolidated(
        Guid id,
        [FromBody] AddPRsToConsolidatedRequest dto,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new AddPRsToConsolidatedCommand(id, dto),
            cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}/prs/{purchaseRequestId}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemovePRFromConsolidated(
        Guid id,
        Guid purchaseRequestId,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new RemovePRFromConsolidatedCommand(id, purchaseRequestId),
            cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    // ── Item-level updates (MoP + AllowPartial) ───────────────────────────────

    [HttpPatch("{id}/items/{itemId}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateConsolidatedPRItem(
        Guid id,
        Guid itemId,
        [FromBody] UpdateConsolidatedPRItemRequest dto,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new UpdateConsolidatedPRItemCommand(itemId, dto),
            cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    // ── Workflow ─────────────────────────────────────────────────────────────

    [HttpPost("{id}/submit")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SubmitConsolidatedPR(
        Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new SubmitConsolidatedPRCommand(id), cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id}/approve")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApproveConsolidatedPR(
        Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new ApproveConsolidatedPRCommand(id), cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id}/return")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ReturnConsolidatedPR(
        Guid id,
        [FromBody] ReturnConsolidatedPRRequest dto,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new ReturnConsolidatedPRCommand(id, dto), cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    // ── Eligible PRs selector (Image 12 modal) ───────────────────────────────

    [HttpGet("{id}/eligible-prs")]
    [ProducesResponseType(typeof(ApiResponse<List<EligiblePRResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetEligiblePRsForCPR(
        Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new GetEligiblePRsForCPRQuery(id), cancellationToken);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Get Consolidated PR items eligible to be sourced into an RFQ (Approved CPRs, remaining quantity > 0)
    /// </summary>
    [HttpGet("for-rfq")]
    [ProducesResponseType(typeof(ApiResponse<List<ConsolidatedPrItemForRFQDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetForRfq()
    {
        var result = await mediator.Send(new GetConsolidatedPrItemsForRFQQuery());
        return Ok(result);
    }
}
