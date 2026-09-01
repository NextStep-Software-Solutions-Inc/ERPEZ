using Microsoft.AspNetCore.Authorization;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Authorization;
using ERPEZ.Application.Features.Planning.OPCRActivityMOV.Commands.CreateOPCRActivityMOV;
using ERPEZ.Application.Features.Planning.OPCRActivityMOV.Commands.DeleteOPCRActivityMOV;
using ERPEZ.Application.Features.Planning.OPCRActivityMOV.Commands.UpdateOPCRActivityMOV;
using ERPEZ.Application.Features.Planning.OPCRActivityMOV.Dtos;
using ERPEZ.Application.Features.Planning.OPCRActivityMOV.Queries.GetOPCRActivityMOVById;
using ERPEZ.Application.Features.Planning.OPCRActivityMOV.Queries.GetOPCRActivityMOVs;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("opcr-activity-movs")]
[ApiController]
[Authorize]
public class OPCRActivityMOVController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [HasPermission(Permissions.Planning.opcrUpdate)]
    public async Task<IActionResult> CreateOPCRActivityMOV([FromBody] CreateOPCRActivityMOVCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetOPCRActivityMOVById), new { id = result.Data }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<OPCRActivityMOVResponse>), StatusCodes.Status200OK)]
    [HasPermission(Permissions.Planning.opcrView)]
    public async Task<IActionResult> GetOPCRActivityMOVs([FromQuery] GetOPCRActivityMOVsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<OPCRActivityMOVDetailedResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Planning.opcrView)]
    public async Task<IActionResult> GetOPCRActivityMOVById(Guid id)
    {
        var result = await mediator.Send(new GetOPCRActivityMOVByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Planning.opcrUpdate)]
    public async Task<IActionResult> UpdateOPCRActivityMOV(Guid id, [FromBody] UpdateOPCRActivityMOVRequest dto)
    {
        var command = new UpdateOPCRActivityMOVCommand
        {
            Id = id,
            UpdateMOV = dto
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Planning.opcrUpdate)]
    public async Task<IActionResult> DeleteOPCRActivityMOV(Guid id)
    {
        var command = new DeleteOPCRActivityMOVCommand(id);
        var result = await mediator.Send(command);

        return result.Succeeded ? NoContent() : NotFound();
    }
}
