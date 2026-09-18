using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Constants;
using ERPEZ.Application.Features.Procurement.AOBs.Commands.ApproveAOB;
using ERPEZ.Application.Features.Procurement.AOBs.Commands.AwardAOB;
using ERPEZ.Application.Features.Procurement.AOBs.Commands.CreateAOB;
using ERPEZ.Application.Features.Procurement.AOBs.Commands.DeleteAOB;
using ERPEZ.Application.Features.Procurement.AOBs.Commands.FinalizeRFQ;
using ERPEZ.Application.Features.Procurement.AOBs.Commands.LinkRFQs;
using ERPEZ.Application.Features.Procurement.AOBs.Commands.UnlinkRFQ;
using ERPEZ.Application.Features.Procurement.AOBs.Commands.ReturnAOB;
using ERPEZ.Application.Features.Procurement.AOBs.Commands.SubmitAOB;
using ERPEZ.Application.Features.Procurement.AOBs.Commands.SubmitSupplierBid;
using ERPEZ.Application.Features.Procurement.AOBs.Commands.UpdateAOB;
using ERPEZ.Application.Features.Procurement.AOBs.Dtos;
using ERPEZ.Application.Features.Procurement.AOBs.Queries.GetAOBById;
using ERPEZ.Application.Features.Procurement.AOBs.Queries.GetAOBMatrix;
using ERPEZ.Application.Features.Procurement.AOBs.Queries.GetAOBs;
using ERPEZ.Application.Features.Procurement.AOBs.Queries.GetApprovedAobsAvailableForPO;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

/// <summary>
/// Manages Abstract of Bids (AOB) operations and BAC award evaluation workflows
/// </summary>
[Route("aobs")]
[ApiController]
[Authorize]
public class AOBController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Get paginated list of AOB records with filtering and sorting
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<AOBResponse>), StatusCodes.Status200OK)]
    [HasPermission(Permissions.Procurement.aobManage)]
    public async Task<IActionResult> GetAOBs([FromQuery] GetAOBsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get approved AOBs that are available for Purchase Order creation (not linked to an active PO)
    /// </summary>
    [HttpGet("available-for-po")]
    [ProducesResponseType(typeof(ApiResponse<List<AvailableAobDto>>), StatusCodes.Status200OK)]
    [HasPermission(Permissions.Procurement.poManage)]
    public async Task<IActionResult> GetAvailableAobsForPO()
    {
        var result = await mediator.Send(new GetApprovedAobsAvailableForPOQuery());
        return Ok(result);
    }

    /// <summary>
    /// Get single AOB details by ID including linked RFQs and awarded items
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<AOBDetailResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.aobManage)]
    public async Task<IActionResult> GetAOBById(Guid id)
    {
        var result = await mediator.Send(new GetAOBByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Create a new AOB in Draft status
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [HasPermission(Permissions.Procurement.aobManage)]
    public async Task<IActionResult> CreateAOB([FromBody] CreateAOBCommand command)
    {
        var result = await mediator.Send(command);
        return result.Succeeded ? CreatedAtAction(nameof(GetAOBById), new { id = result.Data }, result) : BadRequest(result);
    }

    /// <summary>
    /// Update header information of an existing Draft/Returned AOB
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.aobManage)]
    public async Task<IActionResult> UpdateAOB(Guid id, [FromBody] UpdateAOBCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest(ApiResponse<Unit>.Fail("AOB ID in path must match AOB ID in body."));
        }

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Soft-delete an unapproved AOB
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.aobManage)]
    public async Task<IActionResult> DeleteAOB(Guid id)
    {
        var result = await mediator.Send(new DeleteAOBCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Finalize an RFQ for supplier portal bidding
    /// </summary>
    [HttpPost("rfqs/{id}/finalize")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.aobManage)]
    public async Task<IActionResult> FinalizeRFQ(Guid id)
    {
        var result = await mediator.Send(new FinalizeRFQCommand(id));
        if (!result.Succeeded)
        {
            if (result.Message != null && result.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
            {
                return NotFound(result);
            }
            return BadRequest(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Link closed RFQs to an AOB for consolidated bid canvassing
    /// </summary>
    [HttpPost("{id}/link-rfqs")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.aobManage)]
    public async Task<IActionResult> LinkRFQs(Guid id, [FromBody] LinkRFQsCommand command)
    {
        if (id != command.AOBId)
        {
            return BadRequest(ApiResponse<Unit>.Fail("AOB ID in path must match AOB ID in body."));
        }

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Unlink an RFQ from an AOB and remove its items from the evaluation matrix
    /// </summary>
    [HttpDelete("{id}/rfqs/{rfqId}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.aobManage)]
    public async Task<IActionResult> UnlinkRFQ(Guid id, Guid rfqId)
    {
        var result = await mediator.Send(new UnlinkRFQCommand(id, rfqId));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Get the complete bid evaluation matrix including ranked supplier bids per item
    /// </summary>
    [HttpGet("{id}/matrix")]
    [ProducesResponseType(typeof(ApiResponse<AOBMatrixResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.aobManage)]
    public async Task<IActionResult> GetAOBMatrix(Guid id)
    {
        var result = await mediator.Send(new GetAOBMatrixQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Award line items to winning suppliers with justification
    /// </summary>
    [HttpPost("{id}/award")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.aobManage)]
    public async Task<IActionResult> AwardAOB(Guid id, [FromBody] List<AwardItemInputDto> awardedItems)
    {
        var result = await mediator.Send(new AwardAOBCommand { AOBId = id, AwardedItems = awardedItems });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Submit an AOB for BAC Chairperson review (transitions status to ForApproval)
    /// </summary>
    [HttpPost("{id}/submit")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.aobManage)]
    public async Task<IActionResult> SubmitAOB(Guid id, [FromBody] SubmitAOBCommand? command = null)
    {
        var result = await mediator.Send(new SubmitAOBCommand(id, command?.SubmittedBy));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// BAC Chairperson approves an AOB with optional signed resolution PDF
    /// </summary>
    [HttpPost("{id}/approve")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.aobManage)]
    public async Task<IActionResult> ApproveAOB(Guid id, [FromBody] ApproveAOBRequest? request = null)
    {
        Guid? approverGuid = null;
        if (!string.IsNullOrWhiteSpace(request?.ApprovedBy) && Guid.TryParse(request.ApprovedBy, out var parsed))
        {
            approverGuid = parsed;
        }

        var command = new ApproveAOBCommand
        {
            AOBId = id,
            ApprovedBy = approverGuid,
            ApprovedByName = request?.ApprovedBy,
            SignedDocumentUrl = request?.SignedDocumentUrl,
            Remarks = request?.Remarks
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// BAC Chairperson returns an AOB to BAC Secretariat for revision with remarks
    /// </summary>
    [HttpPost("{id}/return")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.aobManage)]
    public async Task<IActionResult> ReturnAOB(Guid id, [FromBody] ReturnAOBRequest? request = null)
    {
        var command = new ReturnAOBCommand(id, request?.Remarks ?? string.Empty);
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Generate official Abstract of Bids / Quotation PDF document
    /// </summary>
    [HttpPost("{id}/generate")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.aobManage)]
    public async Task<IActionResult> GenerateAOBDocument(
        Guid id,
        [FromQuery] ExportFormat format = ExportFormat.Pdf,
        CancellationToken cancellationToken = default)
    {
        var command = new ERPEZ.Application.Features.Procurement.AOBs.Commands.GenerateAOBDocument.GenerateAOBDocumentCommand
        {
            AOBId = id,
            Format = format,
            GeneratedBy = User.Identity?.Name ?? "system"
        };
        var result = await mediator.Send(command, cancellationToken);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}
