using ERPEZ.Application.Features.Planning.RatingScaleTemplate.Commands.CreateRatingScaleTemplate;
using ERPEZ.Application.Features.Planning.RatingScaleTemplate.Commands.UpdateRatingScaleTemplate;
using ERPEZ.Application.Features.Planning.RatingScaleTemplate.Commands.DeleteRatingScaleTemplate;
using ERPEZ.Application.Features.Planning.RatingScaleTemplate.Dtos;
using ERPEZ.Application.Features.Planning.RatingScaleTemplate.Queries.GetRatingScaleTemplateById;
using ERPEZ.Application.Features.Planning.RatingScaleTemplate.Queries.GetRatingScaleTemplates;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("rating-scale-templates")]
[ApiController]
[Authorize]
public class RatingScaleTemplateController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [HasPermission(Permissions.Planning.ratingScaleManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateRatingScaleTemplate([FromBody] CreateRatingScaleTemplateCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetRatingScaleTemplateById), new { id = result.Data }, result);
    }

    [HttpGet]
    [HasPermission(Permissions.Planning.ratingScaleManage)]
    [ProducesResponseType(typeof(PaginatedApiResponse<RatingScaleTemplateResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetRatingScaleTemplates([FromQuery] GetRatingScaleTemplatesQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.Planning.ratingScaleManage)]
    [ProducesResponseType(typeof(ApiResponse<RatingScaleTemplateResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<RatingScaleTemplateResponse>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetRatingScaleTemplateById(Guid id)
    {
        var result = await mediator.Send(new GetRatingScaleTemplateByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [HasPermission(Permissions.Planning.ratingScaleManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateRatingScaleTemplate(Guid id, [FromBody] UpdateRatingScaleTemplateRequest dto)
    {
        var command = new UpdateRatingScaleTemplateCommand { Id = id, UpdateRatingScaleTemplate = dto };
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.Planning.ratingScaleManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteRatingScaleTemplate(Guid id)
    {
        var result = await mediator.Send(new DeleteRatingScaleTemplateCommand(id));

        if (!result.Succeeded)
            return NotFound(result);

        return NoContent();
    }
}

