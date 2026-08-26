using ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Commands.CreateWFPObjectiveActivity;
using ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Commands.DeleteWFPObjectiveActivity;
using ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Commands.UpdateWFPObjectiveActivity;
using ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Queries.GetWFPObjectiveActivityById;
using ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Queries.GetWFPObjectiveActivities;
using ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Commands.BulkCreateWFPObjectiveActivityExpenditure;
using ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("wfp-objective-activities")]
[ApiController]
public class WFPObjectiveActivityController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<WFPObjectiveActivityResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<WFPObjectiveActivityResponse>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateWFPObjectiveActivity([FromBody] CreateWFPObjectiveActivityCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetWFPObjectiveActivityById), new { id = result.Data }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<WFPObjectiveActivityResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWFPObjectiveActivities([FromQuery] GetWFPObjectiveActivitiesQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<WFPObjectiveActivityDetailedResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetWFPObjectiveActivityById(Guid id)
    {
        var result = await mediator.Send(new GetWFPObjectiveActivityByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<WFPObjectiveActivityResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateWFPObjectiveActivity(Guid id, [FromBody] UpdateWFPObjectiveActivityRequest dto)
    {
        var command = new UpdateWFPObjectiveActivityCommand
        {
            Id = id,
            UpdateWFPObjectiveActivity = dto
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteWFPObjectiveActivity(Guid id)
    {
        var command = new DeleteWFPObjectiveActivityCommand(id);
        var result = await mediator.Send(command);

        return result.Succeeded ? NoContent() : BadRequest(result);
    }

    [HttpPost("{id}/expenditures")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> BulkCreateWFPObjectiveActivityExpenditures(Guid id, [FromBody] List<CreateWFPObjectiveActivityExpenditureRequest> expenditureRequests)
    {
        var command = new BulkCreateWFPObjectiveActivityExpenditureCommand
        {
            WFPObjectiveActivityId = id,
            Expenditures = expenditureRequests
        };

        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return NoContent();
    }
}
