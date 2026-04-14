using ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Commands.CreateSubOfficeCeiling;
using ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Commands.DeleteSubOfficeCeiling;
using ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Commands.UpdateSubOfficeCeiling;
using ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Queries.GetSubOfficeCeilingById;
using ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Queries.GetSubOfficeCeilings;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("sub-office-ceilings")]
[ApiController]
public class SubOfficeCeilingController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateSubOfficeCeiling([FromBody] CreateSubOfficeCeilingRequest request)
    {
        var result = await mediator.Send(new CreateSubOfficeCeilingCommand(request));
        return result.Succeeded
            ? CreatedAtAction(nameof(GetSubOfficeCeilingById), new { id = result.Data }, result)
            : BadRequest(result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<SubOfficeCeilingResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSubOfficeCeilings([FromQuery] GetSubOfficeCeilingsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<SubOfficeCeilingResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSubOfficeCeilingById(Guid id)
    {
        var result = await mediator.Send(new GetSubOfficeCeilingByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSubOfficeCeiling(Guid id, [FromBody] UpdateSubOfficeCeilingRequest request)
    {
        var command = new UpdateSubOfficeCeilingCommand(request with { Id = id });
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSubOfficeCeiling(Guid id)
    {
        var result = await mediator.Send(new DeleteSubOfficeCeilingCommand(id));
        return result.Succeeded ? NoContent() : NotFound();
    }
}
