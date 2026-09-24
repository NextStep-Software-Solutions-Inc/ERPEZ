using Microsoft.AspNetCore.Authorization;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Authorization;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.CreateRFQ;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.SubmitRFQ;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.AddRFQItems;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.RemoveRFQItem;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.ReopenRFQ;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.ChangeRFQStatus;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.GenerateRFQDocument;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.UpdateRFQ;
using ERPEZ.Domain.Enums;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetNextRFQNumber;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetRFQNotice;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetRFQById;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetRFQs;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetRFQSummary;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetRFQSupplierBids;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.EvaluateRFQSupplierBid;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

/// <summary>
/// Manages Request for Quotation (RFQ) operations
/// </summary>
[Route("rfqs")]
[ApiController]
[Authorize]
public class RFQController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Create a new Request for Quotation (RFQ)
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [HasPermission(Permissions.Procurement.rfqManage)]
    public async Task<IActionResult> CreateRFQ([FromBody] CreateRFQCommand command)
    {
        var result = await mediator.Send(command);
        return result.Succeeded
            ? CreatedAtAction(nameof(GetRFQById), new { id = result.Data }, result)
            : BadRequest(result);
    }

    /// <summary>
    /// Get all RFQs with filtering, sorting, and pagination
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<RFQListItemDto>), StatusCodes.Status200OK)]
    [HasPermission(Permissions.Procurement.rfqManage)]
    public async Task<IActionResult> GetRFQs([FromQuery] GetRFQsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get RFQ dashboard summary counters (Total, Draft, Submitted, Approved, Returned)
    /// </summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(ApiResponse<RFQSummaryDto>), StatusCodes.Status200OK)]
    [HasPermission(Permissions.Procurement.rfqManage)]
    public async Task<IActionResult> GetRFQSummary()
    {
        var result = await mediator.Send(new GetRFQSummaryQuery());
        return Ok(result);
    }

    /// <summary>
    /// Get the next auto-generated RFQ number
    /// </summary>
    [HttpGet("next-number")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [HasPermission(Permissions.Procurement.rfqManage)]
    public async Task<IActionResult> GetNextRFQNumber([FromQuery] int? year)
    {
        var result = await mediator.Send(new GetNextRFQNumberQuery(year));
        return Ok(result);
    }

    /// <summary>
    /// Get RFQ by ID with details
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<RFQDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<RFQDetailDto>), StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.rfqManage)]
    public async Task<IActionResult> GetRFQById(Guid id)
    {
        var result = await mediator.Send(new GetRFQByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Get RFQ BAC portal posting notice details
    /// </summary>
    [HttpGet("{id}/bac-notice")]
    [ProducesResponseType(typeof(ApiResponse<RFQNoticeDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<RFQNoticeDto>), StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.rfqManage)]
    public async Task<IActionResult> GetRFQNotice(Guid id)
    {
        var result = await mediator.Send(new GetRFQNoticeQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Add or update items in a Request for Quotation (RFQ)
    /// </summary>
    [HttpPost("{id}/items")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
    [HasPermission(Permissions.Procurement.rfqManage)]
    public async Task<IActionResult> AddRFQItems(Guid id, [FromBody] AddRFQItemsCommand command)
    {
        if (id != command.RFQId)
            return BadRequest(ApiResponse<bool>.Fail("Route Id and payload Id do not match."));

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Remove an item from a Request for Quotation (RFQ)
    /// </summary>
    [HttpDelete("{rfqId}/items/{itemId}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
    [HasPermission(Permissions.Procurement.rfqManage)]
    public async Task<IActionResult> RemoveRFQItem(Guid rfqId, Guid itemId)
    {
        var result = await mediator.Send(new RemoveRFQItemCommand(rfqId, itemId));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Submit a Draft RFQ
    /// </summary>
    [HttpPost("{id}/submit")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
    [HasPermission(Permissions.Procurement.rfqManage)]
    public async Task<IActionResult> SubmitRFQ(Guid id)
    {
        var result = await mediator.Send(new SubmitRFQCommand(id));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Approve or Return a Submitted RFQ (BAC Chair action)
    /// </summary>
    [HttpPatch("{id}/status")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
    [HasPermission(Permissions.Procurement.rfqManage)]
    public async Task<IActionResult> ChangeRFQStatus(Guid id, [FromBody] ChangeRFQStatusCommand command)
    {
        if (id != command.RFQId)
            return BadRequest(ApiResponse<bool>.Fail("Route Id and payload Id do not match."));

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Edit an RFQ's header fields and invited suppliers. Allowed while Status is Draft or Returned.
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
    [HasPermission(Permissions.Procurement.rfqManage)]
    public async Task<IActionResult> UpdateRFQ(Guid id, [FromBody] UpdateRFQCommand command)
    {
        command.RFQId = id; // RFQId is [JsonIgnore] — always set from the route, never trust the body

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Reopen a Returned RFQ back to Draft for re-editing
    /// </summary>
    [HttpPatch("{id}/reopen")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
    [HasPermission(Permissions.Procurement.rfqManage)]
    public async Task<IActionResult> ReopenRFQ(Guid id)
    {
        var result = await mediator.Send(new ReopenRFQCommand(id));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Get all submitted supplier bids for an RFQ
    /// </summary>
    [HttpGet("{id}/bids")]
    [ProducesResponseType(typeof(ApiResponse<List<RFQSupplierBidDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [HasPermission(Permissions.Procurement.rfqManage)]
    public async Task<IActionResult> GetRFQSupplierBids(Guid id)
    {
        var result = await mediator.Send(new GetRFQSupplierBidsQuery(id));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Evaluate a supplier bid for an RFQ (Passed / Failed / Pending with remarks)
    /// </summary>
    [HttpPatch("{id}/bids/{bidId}/evaluation")]
    [ProducesResponseType(typeof(ApiResponse<RFQSupplierBidDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.rfqManage)]
    public async Task<IActionResult> EvaluateRFQSupplierBid(
        Guid id,
        Guid bidId,
        [FromBody] EvaluateRFQSupplierBidRequest request)
    {
        var result = await mediator.Send(new EvaluateRFQSupplierBidCommand
        {
            RFQId = id,
            BidId = bidId,
            Request = request
        });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Generate RFQ document (PDF/Excel)
    /// </summary>
    [HttpPost("{id}/generate")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [HasPermission(Permissions.Procurement.rfqManage)]
    public async Task<IActionResult> GenerateRFQ(
        Guid id,
        [FromQuery] ExportFormat format = ExportFormat.Pdf,
        [FromQuery] Guid? supplierId = null,
        [FromQuery] bool blankTemplate = false,
        CancellationToken cancellationToken = default)
    {
        var command = new GenerateRFQDocumentCommand
        {
            RFQId = id,
            Format = format,
            SupplierId = supplierId,
            BlankTemplate = blankTemplate,
            GeneratedBy = User.Identity?.Name ?? "system"
        };
        var result = await mediator.Send(command, cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}
