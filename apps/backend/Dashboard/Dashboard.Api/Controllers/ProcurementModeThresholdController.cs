using ERPEZ.Application.Features.Planning.ProcurementModeThreshold.Commands.CreateProcurementModeThreshold;
using ERPEZ.Application.Features.Planning.ProcurementModeThreshold.Commands.DeleteProcurementModeThreshold;
using ERPEZ.Application.Features.Planning.ProcurementModeThreshold.Commands.UpdateProcurementModeThreshold;
using ERPEZ.Application.Features.Planning.ProcurementModeThreshold.Dtos;
using ERPEZ.Application.Features.Planning.ProcurementModeThreshold.Queries.GetProcurementModeThresholdById;
using ERPEZ.Application.Features.Planning.ProcurementModeThreshold.Queries.GetProcurementModeThresholds;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Sieve.Models;

namespace ERPEZ.Api.Controllers;

[Route("procurement-mode-thresholds")]
[ApiController]
public class ProcurementModeThresholdController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Create a new procurement mode threshold
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateProcurementModeThreshold([FromBody] CreateProcurementModeThresholdCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetProcurementModeThresholdById), new { id = result.Data }, result);
    }

    /// <summary>
    /// Get all procurement mode thresholds with filtering, sorting, and pagination
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<ProcurementModeThresholdResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProcurementModeThresholds([FromQuery] SieveModel sieveModel)
    {
        var query = new GetProcurementModeThresholdsQuery(sieveModel);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get procurement mode threshold by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ProcurementModeThresholdResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ProcurementModeThresholdResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProcurementModeThresholdById(Guid id)
    {
        var query = new GetProcurementModeThresholdByIdQuery(id);
        var result = await mediator.Send(query);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Update an existing procurement mode threshold
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProcurementModeThreshold(Guid id, [FromBody] UpdateProcurementModeThresholdCommand command)
    {
        if (id != command.Id)
        {
            command = command with { Id = id };
        }

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Delete a procurement mode threshold
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProcurementModeThreshold(Guid id)
    {
        var command = new DeleteProcurementModeThresholdCommand(id);
        var result = await mediator.Send(command);
        return result.Succeeded ? NoContent() : NotFound(result);
    }
}
