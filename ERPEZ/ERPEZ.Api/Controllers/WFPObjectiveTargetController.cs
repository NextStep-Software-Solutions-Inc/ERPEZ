using ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Commands.CreateWFPObjectiveTarget;
using ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Commands.DeleteWFPObjectiveTarget;
using ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Commands.UpdateWFPObjectiveTarget;
using ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Queries.GetWFPObjectiveTargetById;
using ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Queries.GetWFPObjectiveTargets;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("wfp-objective-targets")]
[ApiController]
public class WFPObjectiveTargetController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<WFPObjectiveTargetDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<WFPObjectiveTargetDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateWFPObjectiveTarget([FromBody] CreateWFPObjectiveTargetCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetWFPObjectiveTargetById), new { id = result.Data!.Id }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<WFPObjectiveTarget>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWFPObjectiveTargets([FromQuery] GetWFPObjectiveTargetsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<WFPObjectiveTarget>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetWFPObjectiveTargetById(Guid id)
    {
        var result = await mediator.Send(new GetWFPObjectiveTargetByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<WFPObjectiveTargetDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateWFPObjectiveTarget(Guid id, [FromBody] UpdateWFPObjectiveTargetDto dto)
    {
        var command = new UpdateWFPObjectiveTargetCommand
        {
            Id = id,
            UpdateWFPObjectiveTarget = dto
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteWFPObjectiveTarget(Guid id)
    {
        var command = new DeleteWFPObjectiveTargetCommand(id);
        var result = await mediator.Send(command);

        return result.Succeeded ? NoContent() : BadRequest(result);
    }
}
