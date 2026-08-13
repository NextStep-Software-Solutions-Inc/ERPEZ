using ERPEZ.Application.Features.Planning.OPCRItem.Commands.CreateOPCRItem;
using ERPEZ.Application.Features.Planning.OPCRItem.Commands.DeleteOPCRItem;
using ERPEZ.Application.Features.Planning.OPCRItem.Commands.UpdateOPCRItem;
using ERPEZ.Application.Features.Planning.OPCRItem.Dtos;
using ERPEZ.Application.Features.Planning.OPCRItem.Queries.GetOPCRItemById;
using ERPEZ.Application.Features.Planning.OPCRItem.Queries.GetOPCRItems;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("opcr-items")]
[ApiController]
public class OPCRItemController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateOPCRItem([FromBody] CreateOPCRItemCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
        {
            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetOPCRItemById), new { id = result.Data }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<OPCRItemResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOPCRItems([FromQuery] GetOPCRItemsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<OPCRItemResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOPCRItemById(Guid id)
    {
        var result = await mediator.Send(new GetOPCRItemByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateOPCRItem(Guid id, [FromBody] UpdateOPCRItemRequest dto)
    {
        var command = new UpdateOPCRItemCommand
        {
            Id = id,
            UpdateOPCRItem = dto
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteOPCRItem(Guid id)
    {
        var result = await mediator.Send(new DeleteOPCRItemCommand(id));
        return result.Succeeded ? NoContent() : NotFound(result);
    }
}
