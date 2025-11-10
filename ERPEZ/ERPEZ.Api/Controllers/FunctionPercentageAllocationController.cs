using ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.CreateFPAllocation;
using ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.DeleteFPAllocation;
using ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Commands.UpdateFPAllocation;
using ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Dtos;
using ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Queries.GetFPAllocationById;
using ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Queries.GetFPAllocations;
using ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Queries.GetFunctionTypesQuery;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace ERPEZ.Api.Controllers
{
    [Route("function-percentage-allocations")]
    [ApiController]
    public class FunctionPercentageAllocationController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<List<FunctionPercentageAllocationResponse>>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<List<FunctionPercentageAllocationResponse>>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateFunctionPercentageAllocation([FromBody] List<FunctionPercentageAllocationRequest> dto)
        {
            var command = new CreateFunctionPercentageAllocationCommand 
            { 
                FunctionPercentageAllocationsRequests = dto,
            };
            var response = await mediator.Send(command);

            return response.Succeeded ? Ok(response) : BadRequest(response);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<FunctionPercentageAllocationDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetFunctionPercentageAllocations([FromQuery] GetFunctionPercentageAllocationsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<FunctionPercentageAllocationDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetFunctionPercentageAllocationById(Guid id)
        {
            var response = await mediator.Send(new GetFunctionPercentageAllocationByIdQuery(id));
            return response.Succeeded ? Ok(response) : BadRequest(response);
        }
        [HttpGet("function-types")]
        [ProducesResponseType(typeof(ApiResponse<List<string>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetFunctionTypes()
        {
            var query = new GetFunctionTypesQuery();
            var result = await mediator.Send(query);
            return Ok(result);
        }
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateFunctionPercentageAllocation(Guid id, [FromBody] UpdateFunctionPercentageAllocationDto updateDto)
        {
            var request = new UpdateFunctionPercentageAllocationCommand
            {
                Id = id,
                UpdateFPA = updateDto
            };

            var response = await mediator.Send(request);
            return response.Succeeded ? Ok(response) : BadRequest(response);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteFunctionPercentageAllocation(Guid id)
        {
            var command = new DeleteFunctionPercentageAllocationCommand(id);
            var response = await mediator.Send(command);

            return response.Succeeded ? Ok(response) : BadRequest(response);
        }
    }
}