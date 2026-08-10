using ERPEZ.Application.Features.Planning.OfficeType.Commands.CreateOfficeType;
using ERPEZ.Application.Features.Planning.OfficeType.Commands.DeleteOfficeType;
using ERPEZ.Application.Features.Planning.OfficeType.Commands.UpdateOfficeType;
using ERPEZ.Application.Features.Planning.OfficeType.Dtos;
using ERPEZ.Application.Features.Planning.OfficeType.Queries.GetOfficeTypeById;
using ERPEZ.Application.Features.Planning.OfficeType.Queries.GetOfficeTypes;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("office-types")]
[ApiController]
public class OfficeTypeController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateOfficeType([FromBody] CreateOfficeTypeCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetOfficeTypeById), new { id = result.Data }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<OfficeTypeResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOfficeTypes([FromQuery] GetOfficeTypesQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<OfficeTypeResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOfficeTypeById(Guid id)
    {
        var result = await mediator.Send(new GetOfficeTypeByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateOfficeType(Guid id, [FromBody] UpdateOfficeTypeRequest dto)
    {
        var command = new UpdateOfficeTypeCommand { Id = id, UpdateOfficeType = dto };
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteOfficeType(Guid id)
    {
        var result = await mediator.Send(new DeleteOfficeTypeCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
