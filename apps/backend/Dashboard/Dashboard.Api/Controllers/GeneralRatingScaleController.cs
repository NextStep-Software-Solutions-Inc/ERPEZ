using ERPEZ.Application.Features.Planning.GeneralRatingScale.Commands.CreateGeneralRatingScale;
using ERPEZ.Application.Features.Planning.GeneralRatingScale.Commands.DeleteGeneralRatingScale;
using ERPEZ.Application.Features.Planning.GeneralRatingScale.Commands.UpdateGeneralRatingScale;
using ERPEZ.Application.Features.Planning.GeneralRatingScale.Dtos;
using ERPEZ.Application.Features.Planning.GeneralRatingScale.Queries.GetGeneralRatingScaleById;
using ERPEZ.Application.Features.Planning.GeneralRatingScale.Queries.GetGeneralRatingScales;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("general-rating-scales")]
[ApiController]
[Authorize]
public class GeneralRatingScaleController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [HasPermission(Permissions.Planning.ratingScaleManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateGeneralRatingScale([FromBody] CreateGeneralRatingScaleCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetGeneralRatingScaleById), new { id = result.Data }, result);
    }

    [HttpGet]
    [HasPermission(Permissions.Planning.ratingScaleManage)]
    [ProducesResponseType(typeof(PaginatedApiResponse<GeneralRatingScaleResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetGeneralRatingScales([FromQuery] GetGeneralRatingScalesQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.Planning.ratingScaleManage)]
    [ProducesResponseType(typeof(ApiResponse<GeneralRatingScaleResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<GeneralRatingScaleResponse>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetGeneralRatingScaleById(Guid id)
    {
        var result = await mediator.Send(new GetGeneralRatingScaleByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.Planning.ratingScaleManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateGeneralRatingScale(Guid id, [FromBody] UpdateGeneralRatingScaleRequest request)
    {
        var command = new UpdateGeneralRatingScaleCommand
        {
            Id = id,
            AdjectivalRatingName = request.AdjectivalRatingName,
            MinScore = request.MinScore,
            MaxScore = request.MaxScore
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpDelete("{id:guid}")]
    [HasPermission(Permissions.Planning.ratingScaleManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteGeneralRatingScale(Guid id)
    {
        var result = await mediator.Send(new DeleteGeneralRatingScaleCommand(id));

        if (!result.Succeeded)
            return NotFound(result);

        return NoContent();
    }
}
