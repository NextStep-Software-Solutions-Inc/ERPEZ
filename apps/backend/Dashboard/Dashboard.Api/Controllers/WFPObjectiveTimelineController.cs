using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Commands.CreateWFPObjectiveTimeline;
using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Commands.DeleteWFPObjectiveTimeline;
using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Commands.UpdateWFPObjectiveTimeline;
using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Queries.GetWFPObjectiveTimelineById;
using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Queries.GetWFPObjectiveTimelines;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("wfp-objective-timelines")]
[ApiController]
public class WFPObjectiveTimelineController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateWFPObjectiveTimeline([FromBody] CreateWFPObjectiveTimelineCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetWFPObjectiveTimelineById), new { id = result.Data }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<WFPObjectiveTimelineResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWFPObjectiveTimelines([FromQuery] GetWFPObjectiveTimelinesQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<WFPObjectiveTimelineResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetWFPObjectiveTimelineById(Guid id)
    {
        var result = await mediator.Send(new GetWFPObjectiveTimelineByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateWFPObjectiveTimeline(Guid id, [FromBody] UpdateWFPObjectiveTimelineRequest dto)
    {
        var command = new UpdateWFPObjectiveTimelineCommand
        {
            Id = id,
            UpdateWFPObjectiveTimeline = dto
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteWFPObjectiveTimeline(Guid id)
    {
        var command = new DeleteWFPObjectiveTimelineCommand(id);
        var result = await mediator.Send(command);

        return result.Succeeded ? NoContent() : BadRequest(result);
    }
}
