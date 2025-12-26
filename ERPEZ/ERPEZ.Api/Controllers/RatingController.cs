using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Application.Features.Planning.Rating.Dtos;
using ERPEZ.Application.Features.Planning.Rating.Commands.CreateRating;
using ERPEZ.Application.Features.Planning.Rating.Queries.GetRatings;
using ERPEZ.Application.Features.Planning.Rating.Queries.GetRatingById;
using ERPEZ.Application.Features.Planning.Rating.Commands.UpdateRating;
using ERPEZ.Application.Features.Planning.Rating.Commands.DeleteRating;

namespace ERPEZ.Api.Controllers
{
    [Route("ratings")]
    [ApiController]
    public class RatingController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<RatingResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<RatingResponse>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateRating([FromBody] CreateRatingCommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetRatingById), new { id = result.Data!.Id }, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<RatingResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetRatings([FromQuery] GetRatingsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<RatingResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetRatingById(Guid id)
        {
            var result = await mediator.Send(new GetRatingByIdQuery(id));
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<RatingResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateRating(Guid id, [FromBody] UpdateRatingRequest dto)
        {
            var command = new UpdateRatingCommand
            {
                Id = id,
                UpdateRating = dto
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteRating(Guid id)
        {
            var command = new DeleteRatingCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? Ok(result) : BadRequest(result);
        }
    }
}
