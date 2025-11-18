using ERPEZ.Application.Features.Planning.DUAllocation.Commands.CreateDUAllocation;
using ERPEZ.Application.Features.Planning.DUAllocation.Commands.DeleteDUAllocation;
using ERPEZ.Application.Features.Planning.DUAllocation.Commands.UpdateDUAllocation;
using ERPEZ.Application.Features.Planning.DUAllocation.Dtos;
using ERPEZ.Application.Features.Planning.DUAllocation.Queries.GetDUAllocationById;
using ERPEZ.Application.Features.Planning.DUAllocation.Queries.GetDUAllocations;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("du-allocations")]
    [ApiController]
    public class DUAllocationController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<DUAllocationDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<DUAllocationDto>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateDUAllocation([FromBody] CreateDUAllocationCommand command)
        {
            var result = await mediator.Send(command);
            return result.Succeeded ? CreatedAtAction(nameof(GetDUAllocationById), new { id = result.Data}, result) : BadRequest(result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<DUAllocationDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetDUAllocations([FromQuery] GetDUAllocationsQuery query)
        {
            var result = await mediator.Send(query);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<DUAllocationDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetDUAllocationById(Guid id)
        {
            var result = await mediator.Send(new GetDUAllocationByIdQuery(id));
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<DUAllocationDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateDUAllocation(Guid id, [FromBody] UpdateDUAllocationRequest request)
        {
            var command = new UpdateDUAllocationCommand
            {
                Id = id,
                UpdateDUAllocation = request
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteDUAllocation(Guid id)
        {
            var command = new DeleteDUAllocationCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? Ok(result) : BadRequest(result);
        }
    }
}
