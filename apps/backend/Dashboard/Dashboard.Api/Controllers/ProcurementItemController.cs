using ERPEZ.Application.Features.Planning.ProcurementItem.Commands.CreateProcurementItem;
using ERPEZ.Application.Features.Planning.ProcurementItem.Commands.DeleteProcurementItem;
using ERPEZ.Application.Features.Planning.ProcurementItem.Commands.UpdateProcurementItem;
using ERPEZ.Application.Features.Planning.ProcurementItem.Dtos;
using ERPEZ.Application.Features.Planning.ProcurementItem.Queries.GetProcurementItemById;
using ERPEZ.Application.Features.Planning.ProcurementItem.Queries.GetProcurementItems;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Sieve.Models;

namespace ERPEZ.Api.Controllers;

[Route("procurement-items")]
[ApiController]
[Authorize]
public class ProcurementItemController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Create a new procurement item
    /// </summary>
    [HttpPost]
    [HasPermission(Permissions.Procurement.procurementLibraryManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateProcurementItem([FromBody] CreateProcurementItemCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetProcurementItemById), new { id = result.Data }, result);
    }

    /// <summary>
    /// Get all procurement items with filtering, sorting, and pagination
    /// </summary>
    [HttpGet]
    [HasPermission(Permissions.Procurement.procurementLibraryView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<ProcurementItemResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetProcurementItems([FromQuery] SieveModel sieveModel)
    {
        var query = new GetProcurementItemsQuery(sieveModel);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get procurement item by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.Procurement.procurementLibraryView)]
    [ProducesResponseType(typeof(ApiResponse<ProcurementItemResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ProcurementItemResponse>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetProcurementItemById(Guid id)
    {
        var query = new GetProcurementItemByIdQuery(id);
        var result = await mediator.Send(query);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Update an existing procurement item
    /// </summary>
    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.Procurement.procurementLibraryManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateProcurementItem(Guid id, [FromBody] UpdateProcurementItemCommand command)
    {
        if (id != command.Id)
        {
            command = command with { Id = id };
        }

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Delete a procurement item
    /// </summary>
    [HttpDelete("{id:guid}")]
    [HasPermission(Permissions.Procurement.procurementLibraryManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteProcurementItem(Guid id)
    {
        var command = new DeleteProcurementItemCommand(id);
        var result = await mediator.Send(command);
        return result.Succeeded ? NoContent() : NotFound(result);
    }
}
