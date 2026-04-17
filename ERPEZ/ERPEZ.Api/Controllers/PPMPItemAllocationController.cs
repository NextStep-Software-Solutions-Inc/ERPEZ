using ERPEZ.Application.Features.Planning.PPMPItemAllocation.Commands.CreatePPMPItemAllocation;
using ERPEZ.Application.Features.Planning.PPMPItemAllocation.Commands.DeletePPMPItemAllocation;
using ERPEZ.Application.Features.Planning.PPMPItemAllocation.Commands.UpdatePPMPItemAllocation;
using ERPEZ.Application.Features.Planning.PPMPItemAllocation.Dtos;
using ERPEZ.Application.Features.Planning.PPMPItemAllocation.Queries.GetPPMPItemAllocationById;
using ERPEZ.Application.Features.Planning.PPMPItemAllocation.Queries.GetPPMPItemAllocations;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("ppmp-item-allocations")]
[ApiController]
public class PPMPItemAllocationController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreatePPMPItemAllocation([FromBody] CreatePPMPItemAllocationCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetPPMPItemAllocationById), new { id = result.Data }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<PPMPItemAllocationResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPPMPItemAllocations([FromQuery] GetPPMPItemAllocationsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<PPMPItemAllocationResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPPMPItemAllocationById(Guid id)
    {
        var result = await mediator.Send(new GetPPMPItemAllocationByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePPMPItemAllocation(Guid id, [FromBody] UpdatePPMPItemAllocationRequest dto)
    {
        var command = new UpdatePPMPItemAllocationCommand
        {
            Id = id,
            AllocationMonth = dto.AllocationMonth,
            Quantity = dto.Quantity
        };
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePPMPItemAllocation(Guid id)
    {
        var command = new DeletePPMPItemAllocationCommand(id);
        var result = await mediator.Send(command);

        return result.Succeeded ? NoContent() : NotFound();
    }
}
