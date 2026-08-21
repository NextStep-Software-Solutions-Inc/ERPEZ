using ERPEZ.Application.Features.Procurement.AOBs.Commands.SubmitSupplierBid;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Dtos;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetSupplierBid;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetSupplierRFQDetails;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetSupplierRFQInvitations;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

/// <summary>
/// Manages Supplier Portal operations for viewing RFQ invitations and submitting bids
/// </summary>
[Route("api/supplier/rfqs")]
[ApiController]
public class SupplierPortalController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Get RFQ invitations for a supplier
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<SupplierRFQDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRFQInvitations([FromQuery] Guid supplierId)
    {
        var result = await mediator.Send(new GetSupplierRFQInvitationsQuery(supplierId));
        return Ok(result);
    }

    /// <summary>
    /// Get detailed RFQ information for bidding
    /// </summary>
    [HttpGet("{rfqId}")]
    [ProducesResponseType(typeof(ApiResponse<SupplierRFQDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRFQDetails(Guid rfqId, [FromQuery] Guid supplierId)
    {
        var result = await mediator.Send(new GetSupplierRFQDetailsQuery(rfqId, supplierId));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Get supplier's submitted bid for an RFQ
    /// </summary>
    [HttpGet("{rfqId}/my-bid")]
    [ProducesResponseType(typeof(ApiResponse<SupplierBidDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMyBid(Guid rfqId, [FromQuery] Guid supplierId)
    {
        var result = await mediator.Send(new GetSupplierBidQuery(rfqId, supplierId));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Submit a supplier bid for an RFQ
    /// </summary>
    [HttpPost("{rfqId}/bids")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SubmitBid(Guid rfqId, [FromBody] SubmitSupplierBidCommand command)
    {
        if (rfqId != command.RFQId)
        {
            return BadRequest(ApiResponse<Guid>.Fail("RFQ ID in path must match RFQ ID in body."));
        }

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}
