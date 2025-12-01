using ERPEZ.Application.Features.Planning.KPI.Commands.CreateKPI;
using ERPEZ.Application.Features.Planning.KPI.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ERPEZ.Application.Features.Planning.KPI.Queries.GetKPIByIdQuery;
using ERPEZ.Application.Features.Planning.KPI.Queries.GetKPIsQuery;
using ERPEZ.Application.Features.Planning.KPI.Commands.UpdateKPI;
using ERPEZ.Application.Features.Planning.KPI.Commands.DeleteKPI;

namespace ERPEZ.Api.Controllers
{
    [Route("kpis")]
    [ApiController]
    public class KPIController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateKPI([FromBody] CreateKPICommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetKPIById), new { id = result.Data }, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<KPIResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetKPIs([FromQuery] GetKPIsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<KPIResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetKPIById(Guid id)
        {
            var result = await mediator.Send(new GetKPIByIdQuery(id));
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateKPI(Guid id, [FromBody] UpdateKPIRequest dto)
        {
            var command = new UpdateKPICommand(dto, id);
            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteKPI(Guid id)
        {
            var command = new DeleteKPICommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? Ok(result) : BadRequest(result);
        }
    }
}
