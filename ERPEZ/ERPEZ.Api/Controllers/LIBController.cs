using ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.CreateLIB;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.DeleteLIB;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.UpdateLIB;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.UpdateLIBStatus;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Queries.GetLIBById;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Queries.GetLIBs;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("libs")]
[ApiController]
public class LIBController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateLIB([FromBody] CreateLIBRequest request)
    {
        var result = await mediator.Send(new CreateLIBCommand(request));
        return result.Succeeded
            ? CreatedAtAction(nameof(GetLIBById), new { id = result.Data }, result)
            : BadRequest(result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<LIBResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLIBs([FromQuery] GetLIBsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<LIBResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLIBById(Guid id)
    {
        var result = await mediator.Send(new GetLIBByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateLIB(Guid id, [FromBody] UpdateLIBRequest request)
    {
        var command = new UpdateLIBCommand(id, request);
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPut("{id}/status")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateLIBStatus(Guid id, [FromBody] UpdateLIBStatusRequest request)
    {
        var result = await mediator.Send(new UpdateLIBStatusCommand(id, request.Status));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteLIB(Guid id)
    {
        var result = await mediator.Send(new DeleteLIBCommand(id));
        return result.Succeeded ? NoContent() : NotFound();
    }
}
