using ERPEZ.Application.Features.Planning.ProcurementItem.Commands.CreateProcurementItem;
using ERPEZ.Application.Features.Planning.ProcurementItem.Commands.DeleteProcurementItem;
using ERPEZ.Application.Features.Planning.ProcurementItem.Commands.UpdateProcurementItem;
using ERPEZ.Application.Features.Planning.ProcurementItem.Dtos;
using ERPEZ.Application.Features.Planning.ProcurementItem.Queries.GetProcurementItemById;
using ERPEZ.Application.Features.Planning.ProcurementItem.Queries.GetProcurementItems;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Sieve.Models;

namespace ERPEZ.Api.Controllers;

[Route("procurement-items")]
[ApiController]
public class ProcurementItemController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Get all procurement items with filtering, sorting, and pagination
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<ProcurementItemResponse>), StatusCodes.Status200OK)]
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
    [ProducesResponseType(typeof(ApiResponse<ProcurementItemResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ProcurementItemResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProcurementItemById(Guid id)
    {
        var query = new GetProcurementItemByIdQuery(id);
        var result = await mediator.Send(query);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Create a new procurement item
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateProcurementItem([FromBody] CreateProcurementItemCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetProcurementItemById), new { id = result.Data }, result);
    }

    /// <summary>
    /// Update an existing procurement item
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
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
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProcurementItem(Guid id)
    {
        var command = new DeleteProcurementItemCommand(id);
        var result = await mediator.Send(command);
        return result.Succeeded ? NoContent() : NotFound(result);
    }
}
