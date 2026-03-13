using ERPEZ.Application.Features.Planning.KPIAssignment.Commands.CreateKPIAssignment;
using ERPEZ.Application.Features.Planning.KPIAssignment.Commands.UpdateKPIAssignment;
using ERPEZ.Application.Features.Planning.KPIAssignment.Commands.DeleteKPIAssignment;
using ERPEZ.Application.Features.Planning.KPIAssignment.Dtos;
using ERPEZ.Application.Features.Planning.KPIAssignment.Queries.GetKPIAssignments;
using ERPEZ.Application.Features.Planning.KPIAssignment.Queries.GetKPIAssignmentById;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("kpi-assignments")]
[ApiController]
public class KPIAssignmentController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Creates a KPI Assignment (Level 2 - Office Target Distribution)
    /// Validates distribution behavior (Divisible, Uniform, Milestone)
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateKPIAssignment([FromBody] CreateKPIAssignmentCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(CreateKPIAssignment), new { id = result.Data }, result);
    }

    /// <summary>
    /// Gets all KPI Assignments with pagination and filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<KPIAssignmentResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetKPIAssignments([FromQuery] GetKPIAssignmentsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<KPIAssignmentResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<KPIAssignmentResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetKPIAssignmentById(Guid id)
    {
        var result = await mediator.Send(new GetKPIAssignmentByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateKPIAssignment(Guid id, [FromBody] UpdateKPIAssignmentCommand command)
    {
        if (id != command.Id)
            return BadRequest(ApiResponse<Unit>.Fail("ID mismatch."));

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteKPIAssignment(Guid id)
    {
        var result = await mediator.Send(new DeleteKPIAssignmentCommand(id));

        if (!result.Succeeded)
            return NotFound(result);

        return NoContent();
    }
}
