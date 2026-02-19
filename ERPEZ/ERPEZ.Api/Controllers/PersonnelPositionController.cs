using ERPEZ.Application.Features.Planning.PersonnelPosition.Commands.CreatePersonnelPosition;
using ERPEZ.Application.Features.Planning.PersonnelPosition.Commands.DeletePersonnelPosition;
using ERPEZ.Application.Features.Planning.PersonnelPosition.Commands.UpdatePersonnelPosition;
using ERPEZ.Application.Features.Planning.PersonnelPosition.Dtos;
using ERPEZ.Application.Features.Planning.PersonnelPosition.Queries.GetPersonnelPositionById;
using ERPEZ.Application.Features.Planning.PersonnelPosition.Queries.GetPersonnelPositions;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("personnel-positions")]
[ApiController]
public class PersonnelPositionController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreatePersonnelPosition([FromBody] CreatePersonnelPositionCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetPersonnelPositionById), new { id = result.Data }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<PersonnelPositionResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPersonnelPositions([FromQuery] GetPersonnelPositionsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<PersonnelPositionResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPersonnelPositionById(Guid id)
    {
        var result = await mediator.Send(new GetPersonnelPositionByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePersonnelPosition(Guid id, [FromBody] UpdatePersonnelPositionRequest updatePersonnelPosition)
    {
        var request = new UpdatePersonnelPositionCommand
        {
            Id = id,
            UpdatePersonnelPosition = updatePersonnelPosition
        };

        var result = await mediator.Send(request);
        return result.Succeeded ? Ok(ApiResponse<Unit>.Success(Unit.Value)) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePersonnelPosition(Guid id)
    {
        var result = await mediator.Send(new DeletePersonnelPositionCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
