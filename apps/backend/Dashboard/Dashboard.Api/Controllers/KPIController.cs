using ERPEZ.Application.Features.Planning.KPI.Commands.CreateKPI;
using ERPEZ.Application.Features.Planning.KPI.Commands.DeleteKPI;
using ERPEZ.Application.Features.Planning.KPI.Commands.UpdateKPI;
using ERPEZ.Application.Features.Planning.KPI.Dtos;
using ERPEZ.Application.Features.Planning.KPI.Queries.GetKPIByIdQuery;
using ERPEZ.Application.Features.Planning.KPI.Queries.GetKPIsQuery;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("kpis")]
    [ApiController]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public class KPIController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [HasPermission(Permissions.Planning.kpiCreate)]
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
        [HasPermission(Permissions.Planning.kpiView)]
        [ProducesResponseType(typeof(PaginatedApiResponse<KPIResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetKPIs([FromQuery] GetKPIsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [HasPermission(Permissions.Planning.kpiView)]
        [ProducesResponseType(typeof(ApiResponse<KPIDetailedResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetKPIById(Guid id)
        {
            var result = await mediator.Send(new GetKPIByIdQuery(id));
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [HasPermission(Permissions.Planning.kpiUpdate)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateKPI(Guid id, [FromBody] UpdateKPIRequest dto)
        {
            var command = new UpdateKPICommand(id, dto);
            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [HasPermission(Permissions.Planning.kpiDelete)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteKPI(Guid id)
        {
            var command = new DeleteKPICommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? NoContent() : NotFound();
        }
    }
}
