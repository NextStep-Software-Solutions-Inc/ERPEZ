using System;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Planning.ResolutionClause.Commands.CreateResolutionClause;
using ERPEZ.Application.Features.Planning.ResolutionClause.Commands.DeleteResolutionClause;
using ERPEZ.Application.Features.Planning.ResolutionClause.Commands.UpdateResolutionClause;
using ERPEZ.Application.Features.Planning.ResolutionClause.Dtos;
using ERPEZ.Application.Features.Planning.ResolutionClause.Queries.GetResolutionClauseById;
using ERPEZ.Application.Features.Planning.ResolutionClause.Queries.GetResolutionClauses;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("resolution-clauses")]
[ApiController]
public class ResolutionClauseController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateResolutionClause([FromBody] CreateResolutionClauseCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetResolutionClauseById), new { id = result.Data }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<ResolutionClauseResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetResolutionClauses([FromQuery] GetResolutionClausesQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<ResolutionClauseResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetResolutionClauseById(Guid id)
    {
        var result = await mediator.Send(new GetResolutionClauseByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateResolutionClause(Guid id, [FromBody] UpdateResolutionClauseRequest dto)
    {
        var command = new UpdateResolutionClauseCommand(id, dto);
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteResolutionClause(Guid id)
    {
        var result = await mediator.Send(new DeleteResolutionClauseCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
