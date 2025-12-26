using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Commands.CreateKPIPerformanceMeasure;
using ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Commands.DeleteKPIPerformanceMeasure;
using ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Commands.UpdateKPIPerformanceMeasure;
using ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Dtos;
using ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Queries.GetKPIPerformanceMeasureById;
using ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Queries.GetKPIPerformanceMeasures;

namespace ERPEZ.Api.Controllers
{
    [Route("kpi-performance-measures")]
    [ApiController]
    public class KPIPerformanceMeasureController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateKPIPerformanceMeasure([FromBody] CreateKPIPerformanceMeasureRequest request)
        {
            var command = new CreateKPIPerformanceMeasureCommand
            {
                KPIId = request.KPIId,
                PerformanceMeasureId = request.PerformanceMeasureId
            };

            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetKPIPerformanceMeasureById), new { id = result.Data }, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<KPIPerformanceMeasureResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetKPIPerformanceMeasures([FromQuery] GetKPIPerformanceMeasuresQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<KPIPerformanceMeasureDetailedResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetKPIPerformanceMeasureById(Guid id)
        {
            var result = await mediator.Send(new GetKPIPerformanceMeasureByIdQuery(id));
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateKPIPerformanceMeasure(Guid id, [FromBody] UpdateKPIPerformanceMeasureRequest dto)
        {
            var command = new UpdateKPIPerformanceMeasureCommand
            {
                Id = id,
                Dto = dto
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteKPIPerformanceMeasure(Guid id)
        {
            var command = new DeleteKPIPerformanceMeasureCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? NoContent() : NotFound();
        }
    }
}
