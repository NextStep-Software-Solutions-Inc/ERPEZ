using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Application.Features.Planning.DUFundAllocation.Commands.CreateDUFundAllocation;
using ERPEZ.Application.Features.Planning.DUFundAllocation.Dtos;
using ERPEZ.Application.Features.Planning.DUFundAllocation.Queries.GetDUFundAllocations;
using ERPEZ.Application.Features.Planning.DUFundAllocation.Queries.GetDUFundAllocationById;
using ERPEZ.Application.Features.Planning.DUFundAllocation.Commands.UpdateDUFundAllocation;
using ERPEZ.Application.Features.Planning.DUFundAllocation.Commands.DeleteDUFundAllocation;

namespace ERPEZ.Api.Controllers
{
    [Route("du-fund-allocations")]
    [ApiController]
    public class DUFundAllocationController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateDUFundAllocation([FromBody] CreateDUFundAllocationCommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetDUFundAllocationById), new { id = result.Data }, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<DUFundAllocationsResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetDUFundAllocations([FromQuery] GetDUFundAllocationsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<DUFundAllocationResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetDUFundAllocationById(Guid id)
        {
            var result = await mediator.Send(new GetDUFundAllocationByIdQuery(id));
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateDUFundAllocation(Guid id, [FromBody] UpdateDUFundAllocationRequest dto)
        {
            var command = new UpdateDUFundAllocationCommand
            {
                Id = id,
                UpdateDUFundAllocation = dto
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteDUFundAllocation(Guid id)
        {
            var command = new DeleteDUFundAllocationCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? Ok(result) : BadRequest(result);
        }
    }
}
