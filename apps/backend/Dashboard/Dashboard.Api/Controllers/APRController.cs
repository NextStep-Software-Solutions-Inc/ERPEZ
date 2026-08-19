using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.AddCatalogItems;
using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.ChangeAPRStatus;
using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.CreateAPR;
using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.DeleteAPR;
using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.RemoveAPRItem;
using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.SubmitAPR;
using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.UpdateAPR;
using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Dtos;
using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Queries.GetAllocatedAPPItemIds;
using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Queries.GetAPRById;
using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Queries.GetAPRs;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

/// <summary>
/// Manages Agency Purchase Request (APR) operations
/// </summary>
[Route("aprs")]
[ApiController]
public class APRController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Get list of APP item IDs already allocated in active APRs
    /// </summary>
    [HttpGet("allocated-app-item-ids")]
    [ProducesResponseType(typeof(ApiResponse<List<Guid>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllocatedAPPItemIds([FromQuery] Guid? excludeAprId = null)
    {
        var result = await mediator.Send(new GetAllocatedAPPItemIdsQuery(excludeAprId));
        return Ok(result);
    }

    /// <summary>
    /// Create a new Agency Purchase Request (APR) from an approved APP
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateAPR([FromBody] CreateAPRCommand command)
    {
        var result = await mediator.Send(command);
        return result.Succeeded
            ? CreatedAtAction(nameof(GetAPRById), new { id = result.Data }, result)
            : BadRequest(result);
    }

    /// <summary>
    /// Get all APRs with filtering, sorting, and pagination
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<APRListItemDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAPRs([FromQuery] GetAPRsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get APR by ID with all related data (items, milestones, source APP)
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<APRDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<APRDetailDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAPRById(Guid id)
    {
        var result = await mediator.Send(new GetAPRByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Update a Draft APR's header and line items
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAPR(Guid id, [FromBody] UpdateAPRCommand command)
    {
        if (id != command.Id)
            return BadRequest(ApiResponse<Guid>.Fail("Route Id and payload Id do not match."));

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Delete a Draft APR by ID
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAPR(Guid id)
    {
        var result = await mediator.Send(new DeleteAPRCommand(id));
        return result.Succeeded ? NoContent() : NotFound();
    }

    /// <summary>
    /// Submit a Draft APR for approval (renumbers Draft -> flat FY sequence)
    /// </summary>
    [HttpPost("{id}/submit")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SubmitAPR(Guid id)
    {
        var result = await mediator.Send(new SubmitAPRCommand(id));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Change APR status (e.g. ForApproval -> Approved/Returned, Returned -> Draft)
    /// </summary>
    [HttpPatch("{id}/status")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ChangeStatus(
        [FromRoute] Guid id,
        [FromBody] ChangeAPRStatusRequest request)
    {
        var command = new ChangeAPRStatusCommand
        {
            Id = id,
            Status = request.Status,
            Remarks = request.Remarks
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Add or update items from PSDBM catalog in an existing Draft/Returned APR
    /// </summary>
    [HttpPost("{id}/catalog-items")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddCatalogItems(Guid id, [FromBody] AddCatalogItemsToAPRCommand command)
    {
        if (id != command.APRId)
        {
            command = command with { APRId = id };
        }

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Remove an item from a Draft/Returned APR
    /// </summary>
    [HttpDelete("{id}/items/{itemIdentifier}")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveAPRItem(Guid id, string itemIdentifier)
    {
        var result = await mediator.Send(new RemoveAPRItemCommand(id, itemIdentifier));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}
