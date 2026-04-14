using ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Commands.CreateOfficeCeiling;
using ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Commands.DeleteOfficeCeiling;
using ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Commands.UpdateOfficeCeiling;
using ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Queries.GetOfficeCeilingById;
using ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Queries.GetOfficeCeilings;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("office-ceilings")]
[ApiController]
public class OfficeCeilingController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateOfficeCeiling([FromBody] CreateOfficeCeilingRequest request)
    {
        var result = await mediator.Send(new CreateOfficeCeilingCommand(request));
        return result.Succeeded
            ? CreatedAtAction(nameof(GetOfficeCeilingById), new { id = result.Data }, result)
            : BadRequest(result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<OfficeCeilingResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOfficeCeilings()
    {
        var result = await mediator.Send(new GetOfficeCeilingsQuery());
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<OfficeCeilingResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOfficeCeilingById(Guid id)
    {
        var result = await mediator.Send(new GetOfficeCeilingByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateOfficeCeiling(Guid id, [FromBody] UpdateOfficeCeilingRequest request)
    {
        var command = new UpdateOfficeCeilingCommand(request with { Id = id });
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteOfficeCeiling(Guid id)
    {
        var result = await mediator.Send(new DeleteOfficeCeilingCommand(id));
        return result.Succeeded ? NoContent() : NotFound();
    }
}
