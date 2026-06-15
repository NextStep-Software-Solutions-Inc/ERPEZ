using ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Commands.CreateBACResolutionWhereasClause;
using ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Commands.DeleteBACResolutionWhereasClause;
using ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Commands.UpdateBACResolutionWhereasClause;
using ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Dtos;
using ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Queries.GetBACResolutionWhereasClauseById;
using ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Queries.GetBACResolutionWhereasClauses;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("bac-resolution-whereas-clauses")]
[ApiController]
public class BACResolutionWhereasController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateWhereasClause([FromBody] CreateBACResolutionWhereasClauseCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetWhereasClauseById), new { id = result.Data }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<BACResolutionWhereasClauseResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWhereasClauses([FromQuery] GetBACResolutionWhereasClausesQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<BACResolutionWhereasClauseResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetWhereasClauseById(Guid id)
    {
        var result = await mediator.Send(new GetBACResolutionWhereasClauseByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateWhereasClause(Guid id, [FromBody] UpdateBACResolutionWhereasClauseRequest dto)
    {
        var command = new UpdateBACResolutionWhereasClauseCommand { Id = id, UpdateWhereasClause = dto };
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteWhereasClause(Guid id)
    {
        var result = await mediator.Send(new DeleteBACResolutionWhereasClauseCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
