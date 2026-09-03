using ERPEZ.Application.Features.Planning.Step.Commands.CreateStep;
using ERPEZ.Application.Features.Planning.Step.Commands.DeleteStep;
using ERPEZ.Application.Features.Planning.Step.Commands.UpdateStep;
using ERPEZ.Application.Features.Planning.Step.Dtos;
using ERPEZ.Application.Features.Planning.Step.Queries.GetStepById;
using ERPEZ.Application.Features.Planning.Step.Queries.GetSteps;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("steps")]
[ApiController]
[Authorize]
public class StepController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [HasPermission(Permissions.Admin.orgStructureManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateStep([FromBody] CreateStepCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetStepById), new { id = result.Data }, result);
    }

    [HttpGet]
    [HasPermission(Permissions.Admin.orgStructureView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<StepResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetSteps([FromQuery] GetStepsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.Admin.orgStructureView)]
    [ProducesResponseType(typeof(ApiResponse<StepResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetStepById(Guid id)
    {
        var result = await mediator.Send(new GetStepByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [HasPermission(Permissions.Admin.orgStructureManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateStep(Guid id, [FromBody] UpdateStepRequest updateStep)
    {
        var request = new UpdateStepCommand
        {
            Id = id,
            UpdateStep = updateStep
        };

        var result = await mediator.Send(request);
        return result.Succeeded ? Ok(ApiResponse<Unit>.Success(Unit.Value)) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.Admin.orgStructureManage)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteStep(Guid id)
    {
        var result = await mediator.Send(new DeleteStepCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
