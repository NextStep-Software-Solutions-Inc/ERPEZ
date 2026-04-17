using ERPEZ.Application.Features.Planning.NonCSEItem.Commands.CreateNonCSEItem;
using ERPEZ.Application.Features.Planning.NonCSEItem.Commands.DeleteNonCSEItem;
using ERPEZ.Application.Features.Planning.NonCSEItem.Commands.UpdateNonCSEItemStatus;
using ERPEZ.Application.Features.Planning.NonCSEItem.Commands.UpdateNonCSEItem;
using ERPEZ.Application.Features.Planning.NonCSEItem.Dtos;
using ERPEZ.Application.Features.Planning.NonCSEItem.Queries.GetNonCSEItemById;
using ERPEZ.Application.Features.Planning.NonCSEItem.Queries.GetNonCSEItems;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("non-cse-items")]
[ApiController]
public class NonCSEItemController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateNonCSEItem([FromBody] CreateNonCSEItemCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetNonCSEItemById), new { id = result.Data }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<NonCSEItemResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNonCSEItems([FromQuery] GetNonCSEItemsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<NonCSEItemResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetNonCSEItemById(Guid id)
    {
        var result = await mediator.Send(new GetNonCSEItemByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateNonCSEItem(Guid id, [FromBody] UpdateNonCSEItemRequest dto)
    {
        var command = new UpdateNonCSEItemCommand
        {
            Id = id,
            Name = dto.Name,
            Description = dto.Description,
            UOMId = dto.UOMId,
            ItemRequestId = dto.ItemRequestId,
            ProductCode = dto.ProductCode,
            CurrentPrice = dto.CurrentPrice,
            Remarks = dto.Remarks,
            IsActive = dto.IsActive
        };
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPut("{id}/status")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateNonCSEItemStatus(Guid id, [FromBody] UpdateNonCSEItemStatusRequest request)
    {
        var command = new UpdateNonCSEItemStatusCommand
        {
            Id = id,
            IsActive = request.IsActive
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteNonCSEItem(Guid id)
    {
        var command = new DeleteNonCSEItemCommand(id);
        var result = await mediator.Send(command);

        return result.Succeeded ? NoContent() : NotFound();
    }
}
