using ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.ActivateFYActiveKPI;
using ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.UpdateFYActiveKPI;
using ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.DeleteFYActiveKPI;
using ERPEZ.Application.Features.Planning.FYActiveKPI.Queries.GetFYActiveKPIs;
using ERPEZ.Application.Features.Planning.FYActiveKPI.Queries.GetFYActiveKPIById;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Sieve.Models;

namespace ERPEZ.Api.Controllers;

[Route("fy-active-kpis")]
[ApiController]
public class FYActiveKPIController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Activates a Master KPI for a specific fiscal year (Clone Service)
    /// </summary>
    [HttpPost("activate")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ActivateFYActiveKPI([FromBody] ActivateFYActiveKPICommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetFYActiveKPIs), new { fiscalYearId = command.FiscalYearId }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<FYActiveKPIResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFYActiveKPIs([FromQuery] SieveModel sieveModel)
    {
        var query = new GetFYActiveKPIsQuery(sieveModel);
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<FYActiveKPIResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<FYActiveKPIResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetFYActiveKPIById(Guid id)
    {
        var result = await mediator.Send(new GetFYActiveKPIByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateFYActiveKPI(Guid id, [FromBody] UpdateFYActiveKPICommand command)
    {
        if (id != command.Id)
            return BadRequest(ApiResponse<Unit>.Fail("ID mismatch."));

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : NotFound(result);
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
