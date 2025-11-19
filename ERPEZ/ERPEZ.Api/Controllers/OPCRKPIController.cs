using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Application.Features.Planning.OPCRKPI.Commands.CreateOPCRKPI;
using ERPEZ.Application.Features.Planning.OPCRKPI.Dtos;
using ERPEZ.Application.Features.Planning.OPCRKPI.Queries.GetOPCRKPIs;
using ERPEZ.Application.Features.Planning.OPCRKPI.Queries.GetOPCRKPIById;
using ERPEZ.Application.Features.Planning.OPCRKPI.Commands.DeleteOPCRKPI;

namespace ERPEZ.Api.Controllers
{
    [Route("opcr-kpis")]
    [ApiController]
    public class OPCRKPIController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<OPCRKPI>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<OPCRKPI>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateOPCRKPI([FromBody] CreateOPCRKPICommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetOPCRKPIById), new { id = result.Data!.Id }, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<OPCRKPIDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetOPCRKPIs([FromQuery] GetOPCRKPIsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<OPCRKPIDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetOPCRKPIById(Guid id)
        {
            var result = await mediator.Send(new GetOPCRKPIByIdQuery(id));
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteOPCRKPI(Guid id)
        {
            var command = new DeleteOPCRKPICommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? Ok(result) : BadRequest(result);
        }
    }
}
