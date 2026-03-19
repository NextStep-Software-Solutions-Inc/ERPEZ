using ERPEZ.Application.Features.Planning.RatingScaleTemplate.Commands.CreateRatingScaleTemplate;
using ERPEZ.Application.Features.Planning.RatingScaleTemplate.Commands.UpdateRatingScaleTemplate;
using ERPEZ.Application.Features.Planning.RatingScaleTemplate.Commands.DeleteRatingScaleTemplate;
using ERPEZ.Application.Features.Planning.RatingScaleTemplate.Dtos;
using ERPEZ.Application.Features.Planning.RatingScaleTemplate.Queries.GetRatingScaleTemplateById;
using ERPEZ.Application.Features.Planning.RatingScaleTemplate.Queries.GetRatingScaleTemplates;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("rating-scale-templates")]
[ApiController]
public class RatingScaleTemplateController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateRatingScaleTemplate([FromBody] CreateRatingScaleTemplateCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetRatingScaleTemplateById), new { id = result.Data }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<RatingScaleTemplateResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRatingScaleTemplates([FromQuery] GetRatingScaleTemplatesQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<RatingScaleTemplateResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<RatingScaleTemplateResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRatingScaleTemplateById(Guid id)
    {
        var result = await mediator.Send(new GetRatingScaleTemplateByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateRatingScaleTemplate(Guid id, [FromBody] UpdateRatingScaleTemplateRequest dto)
    {
        var command = new UpdateRatingScaleTemplateCommand { Id = id, UpdateRatingScaleTemplate = dto };
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteRatingScaleTemplate(Guid id)
    {
        var result = await mediator.Send(new DeleteRatingScaleTemplateCommand(id));

        if (!result.Succeeded)
            return NotFound(result);

        return NoContent();
    }
}

