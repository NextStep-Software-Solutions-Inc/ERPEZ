using ERPEZ.Application.Features.Planning.UOM.Commands.CreateUOM;
using ERPEZ.Application.Features.Planning.UOM.Commands.DeleteUOM;
using ERPEZ.Application.Features.Planning.UOM.Commands.UpdateUOM;
using ERPEZ.Application.Features.Planning.UOM.Dtos;
using ERPEZ.Application.Features.Planning.UOM.Queries.GetUOMById;
using ERPEZ.Application.Features.Planning.UOM.Queries.GetUOMs;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Sieve.Models;

namespace ERPEZ.Api.Controllers;

[Route("uoms")]
[ApiController]
public class UOMController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Get all units of measure with filtering, sorting, and pagination
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<UOMResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUOMs([FromQuery] SieveModel sieveModel)
    {
        var query = new GetUOMsQuery(sieveModel);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get unit of measure by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<UOMResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<UOMResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUOMById(Guid id)
    {
        var query = new GetUOMByIdQuery(id);
        var result = await mediator.Send(query);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Create a new unit of measure
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateUOM([FromBody] CreateUOMCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetUOMById), new { id = result.Data }, result);
    }

    /// <summary>
    /// Update an existing unit of measure
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUOM(Guid id, [FromBody] UpdateUOMCommand command)
    {
        if (id != command.Id)
        {
            command = command with { Id = id };
        }

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Delete a unit of measure
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUOM(Guid id)
    {
        var command = new DeleteUOMCommand(id);
        var result = await mediator.Send(command);
        return result.Succeeded ? NoContent() : NotFound(result);
    }
}
