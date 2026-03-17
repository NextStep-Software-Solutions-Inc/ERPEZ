using ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.ActivateFYActiveKPI;
using ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.UpdateFYActiveKPI;
using ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.DeleteFYActiveKPI;
using ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.SetTargets;
using ERPEZ.Application.Features.Planning.FYActiveKPI.Dtos;
using ERPEZ.Application.Features.Planning.FYActiveKPI.Queries.GetFYActiveKPIs;
using ERPEZ.Application.Features.Planning.FYActiveKPI.Queries.GetFYActiveKPIById;
using ERPEZ.Application.Features.Planning.FYActiveKPI.Queries.ValidateForAssignment;
using FYActiveKPIDetails = ERPEZ.Application.Features.Planning.FYActiveKPI.Queries.GetFYActiveKPIById.FYActiveKPIDetailedResponse;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("fy-active-kpis")]
[ApiController]
public class FYActiveKPIController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Activates Master KPIs for a specific fiscal year (Bulk Clone Service)
    /// </summary>
    [HttpPost("activate/bulk")]
    [ProducesResponseType(typeof(ApiResponse<List<FYActiveKPIResponse>>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<List<FYActiveKPIResponse>>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ActivateFYActiveKPI([FromBody] ActivateFYActiveKPICommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetFYActiveKPIs), new { fiscalYearId = command.FiscalYearId }, result);
    }

    /// <summary>
    /// Bulk set/update agency targets for activated KPIs.
    /// All KPIs in the batch must belong to the same fiscal year.
    /// </summary>
    [HttpPut("targets/bulk")]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SetTargets([FromBody] List<SetTargetRequest> targets)
    {
        var command = new SetFYActiveKPITargetsCommand(targets);
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Validate if all KPIs for a fiscal year have targets set and are ready for assignment
    /// </summary>
    [HttpGet("validate-for-assignment")]
    [ProducesResponseType(typeof(ApiResponse<ValidationResult>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ValidateForAssignment([FromQuery] Guid fiscalYearId)
    {
        var result = await mediator.Send(new ValidateForAssignmentQuery(fiscalYearId));
        return Ok(result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<FYActiveKPIResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFYActiveKPIs([FromQuery] GetFYActiveKPIsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<FYActiveKPIDetails>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<FYActiveKPIDetails>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetFYActiveKPIById(Guid id)
    {
        var result = await mediator.Send(new GetFYActiveKPIByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateFYActiveKPI(Guid id, [FromBody] UpdateFYActiveKPICommand command)
    {
        var response = await mediator.Send(command with { Id = id });
        return Ok(response);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteFYActiveKPI(Guid id)
    {
        var result = await mediator.Send(new DeleteFYActiveKPICommand(id));

        if (!result.Succeeded)
            return NotFound(result);

        return NoContent();
    }
}
