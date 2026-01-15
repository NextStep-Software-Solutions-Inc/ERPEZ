using ERPEZ.Application.Features.Planning.OPCRActivityRating.Commands.CreateOPCRActivityRating;
using ERPEZ.Application.Features.Planning.OPCRActivityRating.Commands.CreateOPCRActivityRatingsBatch;
using ERPEZ.Application.Features.Planning.OPCRActivityRating.Commands.DeleteOPCRActivityRating;
using ERPEZ.Application.Features.Planning.OPCRActivityRating.Commands.UpdateOPCRActivityRating;
using ERPEZ.Application.Features.Planning.OPCRActivityRating.Dtos;
using ERPEZ.Application.Features.Planning.OPCRActivityRating.Queries.GetOPCRActivityRatingById;
using ERPEZ.Application.Features.Planning.OPCRActivityRating.Queries.GetOPCRActivityRatings;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("opcr-activity-ratings")]
[ApiController]
public class OPCRActivityRatingController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateOPCRActivityRating([FromBody] CreateOPCRActivityRatingCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetOPCRActivityRatingById), new { id = result.Data }, result);
    }

    [HttpPost("batch")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateOPCRActivityRatingsBatch([FromBody] CreateOPCRActivityRatingsBatchCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return Created(string.Empty, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<OPCRActivityRatingResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOPCRActivityRatings([FromQuery] GetOPCRActivityRatingsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<OPCRActivityRatingDetailedResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOPCRActivityRatingById(Guid id)
    {
        var result = await mediator.Send(new GetOPCRActivityRatingByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateOPCRActivityRating(Guid id, [FromBody] UpdateOPCRActivityRatingRequest dto)
    {
        var command = new UpdateOPCRActivityRatingCommand
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
    public async Task<IActionResult> DeleteOPCRActivityRating(Guid id)
    {
        var command = new DeleteOPCRActivityRatingCommand(id);
        var result = await mediator.Send(command);

        return result.Succeeded ? NoContent() : NotFound();
    }
}
