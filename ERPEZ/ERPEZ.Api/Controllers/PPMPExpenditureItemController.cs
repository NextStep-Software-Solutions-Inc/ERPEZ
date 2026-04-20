using ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Commands.CreatePPMPExpenditureItem;
using ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Commands.DeletePPMPExpenditureItem;
using ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Commands.UpdatePPMPExpenditureItem;
using ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Dtos;
using ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Queries.GetPPMPExpenditureItemById;
using ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Queries.GetPPMPExpenditureItems;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("ppmp-expenditure-items")]
[ApiController]
public class PPMPExpenditureItemController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreatePPMPExpenditureItem([FromBody] CreatePPMPExpenditureItemCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetPPMPExpenditureItemById), new { id = result.Data }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<PPMPExpenditureItemResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPPMPExpenditureItems([FromQuery] GetPPMPExpenditureItemsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<PPMPExpenditureItemResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPPMPExpenditureItemById(Guid id)
    {
        var result = await mediator.Send(new GetPPMPExpenditureItemByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePPMPExpenditureItem(Guid id, [FromBody] UpdatePPMPExpenditureItemRequest dto)
    {
        var command = new UpdatePPMPExpenditureItemCommand
        {
            Id = id,
            PPMPActivityId = dto.PPMPActivityId,
            IsProcurable = dto.IsProcurable,
            TotalCost = dto.TotalCost
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePPMPExpenditureItem(Guid id)
    {
        var result = await mediator.Send(new DeletePPMPExpenditureItemCommand(id));
        return result.Succeeded ? NoContent() : NotFound(result);
    }
}
