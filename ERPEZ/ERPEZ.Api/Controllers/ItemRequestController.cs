using ERPEZ.Application.Features.Planning.ItemRequest.Commands.CreateItemRequest;
using ERPEZ.Application.Features.Planning.ItemRequest.Commands.DeleteItemRequest;
using ERPEZ.Application.Features.Planning.ItemRequest.Commands.UpdateItemRequest;
using ERPEZ.Application.Features.Planning.ItemRequest.Dtos;
using ERPEZ.Application.Features.Planning.ItemRequest.Queries.GetItemRequestById;
using ERPEZ.Application.Features.Planning.ItemRequest.Queries.GetItemRequests;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("item-requests")]
[ApiController]
public class ItemRequestController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateItemRequest([FromBody] CreateItemRequestCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetItemRequestById), new { id = result.Data }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<ItemRequestResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetItemRequests([FromQuery] GetItemRequestsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<ItemRequestResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetItemRequestById(Guid id)
    {
        var result = await mediator.Send(new GetItemRequestByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateItemRequest(Guid id, [FromBody] UpdateItemRequestRequest dto)
    {
        var command = new UpdateItemRequestCommand
        {
            Id = id,
            Name = dto.Name,
            ItemCategory = dto.ItemCategory,
            Status = dto.Status,
            EstimatedUnitCost = dto.EstimatedUnitCost,
            UOMId = dto.UOMId,
            ProcurementCategoryId = dto.ProcurementCategoryId,
            TechnicalSpecification = dto.TechnicalSpecification,
            TWGRemarks = dto.TWGRemarks,
            UACSCode = dto.UACSCode,
            UNSCPSCCode = dto.UNSCPSCCode
        };
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteItemRequest(Guid id)
    {
        var command = new DeleteItemRequestCommand(id);
        var result = await mediator.Send(command);

        return result.Succeeded ? NoContent() : NotFound();
    }
}
