using ERPEZ.Application.Features.Planning.PPMPItem.Commands.CreatePPMPItem;
using ERPEZ.Application.Features.Planning.PPMPItem.Commands.DeletePPMPItem;
using ERPEZ.Application.Features.Planning.PPMPItem.Commands.UpdatePPMPItem;
using ERPEZ.Application.Features.Planning.PPMPItem.Dtos;
using ERPEZ.Application.Features.Planning.PPMPItem.Queries.GetPPMPItemById;
using ERPEZ.Application.Features.Planning.PPMPItem.Queries.GetPPMPItems;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("ppmp-items")]
[ApiController]
public class PPMPItemController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreatePPMPItem([FromBody] CreatePPMPItemCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetPPMPItemById), new { id = result.Data }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<PPMPItemResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPPMPItems([FromQuery] GetPPMPItemsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<PPMPItemResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPPMPItemById(Guid id)
    {
        var result = await mediator.Send(new GetPPMPItemByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePPMPItem(Guid id, [FromBody] UpdatePPMPItemRequest dto)
    {
        var command = new UpdatePPMPItemCommand
        {
            Id = id,
            PPMPExpenditureItemId = dto.PPMPExpenditureItemId,
            CSEItemId = dto.CSEItemId,
            NonCSEItemId = dto.NonCSEItemId,
            ProcurementModeId = dto.ProcurementModeId,
            PAPCode = dto.PAPCode,
            Name = dto.Name,
            Description = dto.Description,
            Unit = dto.Unit,
            UnitPrice = dto.UnitPrice,
            MOPOverride = dto.MOPOverride,
            MOPJustification = dto.MOPJustification
        };
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePPMPItem(Guid id)
    {
        var command = new DeletePPMPItemCommand(id);
        var result = await mediator.Send(command);

        return result.Succeeded ? NoContent() : NotFound();
    }
}
