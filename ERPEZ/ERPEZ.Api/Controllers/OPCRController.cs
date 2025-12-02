using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Application.Features.Planning.OPCR.Commands.CreateOPCR;
using ERPEZ.Application.Features.Planning.OPCR.Dtos;
using ERPEZ.Application.Features.Planning.OPCR.Queries.GetOPCRs;
using ERPEZ.Application.Features.Planning.OPCR.Queries.GetOPCRById;
using ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCR;
using ERPEZ.Application.Features.Planning.OPCR.Commands.DeleteOPCR;

namespace ERPEZ.Api.Controllers
{
    [Route("opcrs")]
    [ApiController]
    public class OPCRController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<OPCR>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<OPCR>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateOPCR([FromBody] CreateOPCRCommand command)
        {
            var result = await mediator.Send(command);
            return result.Succeeded ? CreatedAtAction(nameof(GetOPCRById), new { id = result.Data }, result) : BadRequest(result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<OPCRDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetOPCRs([FromQuery] GetOPCRsQuery query)
        {
            var result = await mediator.Send(query);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<OPCRDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetOPCRById(Guid id)
        {
            var result = await mediator.Send(new GetOPCRByIdQuery(id));
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateOPCR(Guid id, [FromBody] UpdateOPCRRequest dto)
        {
            var command = new UpdateOPCRCommand
            {
                Id = id,
                UpdateOPCR = dto
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteOPCR(Guid id)
        {
            var command = new DeleteOPCRCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? Ok(result) : BadRequest(result);
        }
    }
}
