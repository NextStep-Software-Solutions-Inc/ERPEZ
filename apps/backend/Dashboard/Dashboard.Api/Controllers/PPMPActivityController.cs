using Microsoft.AspNetCore.Authorization;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Authorization;
using ERPEZ.Application.Features.Planning.PPMPActivity.Commands.CreatePPMPActivity;
using ERPEZ.Application.Features.Planning.PPMPActivity.Commands.DeletePPMPActivity;
using ERPEZ.Application.Features.Planning.PPMPActivity.Queries.GetPPMPActivities;
using ERPEZ.Application.Features.Planning.PPMPActivity.Dtos;
using ERPEZ.Application.Features.Planning.PPMPActivity.Queries.GetPPMPActivityById;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("ppmp-activities")]
[ApiController]
[Authorize]
public class PPMPActivityController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [HasPermission(Permissions.Procurement.ppmpUpdate)]
    public async Task<IActionResult> CreatePPMPActivity([FromBody] CreatePPMPActivityCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetPPMPActivityById), new { id = result.Data }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<PPMPActivityResponse>), StatusCodes.Status200OK)]
    [HasPermission(Permissions.Procurement.ppmpView)]
    public async Task<IActionResult> GetPPMPActivities([FromQuery] GetPPMPActivitiesQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<PPMPActivityResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.ppmpView)]
    public async Task<IActionResult> GetPPMPActivityById(Guid id)
    {
        var result = await mediator.Send(new GetPPMPActivityByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Procurement.ppmpUpdate)]
    public async Task<IActionResult> DeletePPMPActivity(Guid id)
    {
        var result = await mediator.Send(new DeletePPMPActivityCommand(id));
        return result.Succeeded ? NoContent() : NotFound(result);
    }
}
