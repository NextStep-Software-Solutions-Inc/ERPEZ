using Microsoft.AspNetCore.Authorization;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Authorization;
using ERPEZ.Application.Features.Planning.OPCRRating.Commands.CreateOPCRRating;
using ERPEZ.Application.Features.Planning.OPCRRating.Commands.DeleteOPCRRating;
using ERPEZ.Application.Features.Planning.OPCRRating.Commands.UpdateOPCRRating;
using ERPEZ.Application.Features.Planning.OPCRRating.Dtos;
using ERPEZ.Application.Features.Planning.OPCRRating.Queries.GetOPCRRatingById;
using ERPEZ.Application.Features.Planning.OPCRRating.Queries.GetOPCRRatings;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("opcr-ratings")]
    [ApiController]
    [Authorize]
public class OPCRRatingController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<OPCRRatingResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<OPCRRatingResponse>), StatusCodes.Status400BadRequest)]
        [HasPermission(Permissions.Planning.opcrEvaluate)]
        public async Task<IActionResult> CreateOPCRRating([FromBody] CreateOPCRRatingCommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetOPCRRatingById), new { id = result.Data }, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<OPCRRatingResponse>), StatusCodes.Status200OK)]
        [HasPermission(Permissions.Planning.opcrView)]
        public async Task<IActionResult> GetOPCRRatings([FromQuery] GetOPCRRatingsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<OPCRRatingResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HasPermission(Permissions.Planning.opcrView)]
        public async Task<IActionResult> GetOPCRRatingById(Guid id)
        {
            var result = await mediator.Send(new GetOPCRRatingByIdQuery(id));

            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<OPCRRatingResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HasPermission(Permissions.Planning.opcrEvaluate)]
        public async Task<IActionResult> UpdateOPCRRating(Guid id, [FromBody] UpdateOPCRRatingRequest dto)
        {
            var command = new UpdateOPCRRatingCommand
            {
                Id = id,
                UpdateOPCRRating = dto
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HasPermission(Permissions.Planning.opcrEvaluate)]
        public async Task<IActionResult> DeleteOPCRRating(Guid id)
        {
            var command = new DeleteOPCRRatingCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? Ok(result) : NoContent();
        }
    }
}
