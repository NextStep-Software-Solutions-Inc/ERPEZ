using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Application.Features.Planning.KPIRating.Dtos;
using ERPEZ.Application.Features.Planning.KPIRating.Commands.CreateKPIRating;
using ERPEZ.Application.Features.Planning.KPIRating.Queries.GetKPIRatings;
using ERPEZ.Application.Features.Planning.KPIRating.Queries.GetKPIRatingById;
using ERPEZ.Application.Features.Planning.KPIRating.Commands.UpdateKPIRating;
using ERPEZ.Application.Features.Planning.KPIRating.Commands.DeleteKPIRating;

namespace ERPEZ.Api.Controllers
{
    [Route("kpiratings")]
    [ApiController]
    public class KPIRatingController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<KPIRating>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<KPIRating>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateKPIRating([FromBody] CreateKPIRatingCommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetKPIRatingById), new { id = result.Data!.Id }, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<KPIRatingDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetKPIRatings([FromQuery] GetKPIRatingsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<KPIRatingDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetKPIRatingById(Guid id)
        {
            var result = await mediator.Send(new GetKPIRatingByIdQuery(id));
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<KPIRatingDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateKPIRating(Guid id, [FromBody] UpdateKPIRatingDto dto)
        {
            var command = new UpdateKPIRatingCommand
            {
                Id = id,
                UpdateKPIRating = dto
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteKPIRating(Guid id)
        {
            var command = new DeleteKPIRatingCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? Ok(result) : BadRequest(result);
        }
    }
}