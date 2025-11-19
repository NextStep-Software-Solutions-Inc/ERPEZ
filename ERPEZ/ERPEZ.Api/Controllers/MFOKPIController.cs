using ERPEZ.Application.Features.Planning.MFOKPI.Dtos;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ERPEZ.Application.Features.Planning.MFOKPI.Queries.GetMFOKPIsQuery;
using ERPEZ.Application.Features.Planning.MFOKPI.Commands.CreateMFOKPI;
using ERPEZ.Application.Features.Planning.MFOKPI.Queries.GetMFOKPIByIdQuery;
using ERPEZ.Application.Features.Planning.MFOKPI.Commands.DeleteMFOKPI;

namespace ERPEZ.Api.Controllers
{
    [Route("mfo-kpis")]
    [ApiController]
    public class MFOKPIController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<MFOKPI>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<MFOKPI>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateMFOKPI([FromBody] CreateMFOKPICommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetMFOKPIById), new { id = result.Data!.Id }, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<MFOKPIDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetMFOKPIs([FromQuery] GetMFOKPIsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<MFOKPIDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetMFOKPIById(Guid id)
        {
            var result = await mediator.Send(new GetMFOKPIByIdQuery(id));
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteMFOKPI(Guid id)
        {
            var command = new DeleteMFOKPICommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? Ok(result) : BadRequest(result);
        }
    }
}
