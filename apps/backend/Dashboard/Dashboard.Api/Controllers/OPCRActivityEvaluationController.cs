using ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Commands.CreateOPCRActivityEvaluation;
using ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Commands.CreateOPCRActivityEvaluationsBatch;
using ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Commands.DeleteOPCRActivityEvaluation;
using ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Commands.UpdateOPCRActivityEvaluation;
using ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Commands.UpdateOPCRActivityEvaluationStatus;
using ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Dtos;
using ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Queries.GetOPCRActivityEvaluationById;
using ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Queries.GetOPCRActivityEvaluations;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("opcr-activity-evaluations")]
[ApiController]
public class OPCRActivityEvaluationController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateOPCRActivityEvaluation([FromBody] CreateOPCRActivityEvaluationCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetOPCRActivityEvaluationById), new { id = result.Data }, result);
    }

    [HttpPost("batch")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateOPCRActivityEvaluationsBatch([FromBody] CreateOPCRActivityEvaluationsBatchCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return Created(string.Empty, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<OPCRActivityEvaluationResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOPCRActivityEvaluations([FromQuery] GetOPCRActivityEvaluationsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<OPCRActivityEvaluationDetailedResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOPCRActivityEvaluationById(Guid id)
    {
        var result = await mediator.Send(new GetOPCRActivityEvaluationByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateOPCRActivityEvaluation(Guid id, [FromBody] UpdateOPCRActivityEvaluationRequest dto)
    {
        var command = new UpdateOPCRActivityEvaluationCommand
        {
            Id = id,
            UpdateEvaluation = dto
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPut("{id}/status")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateOPCRActivityEvaluationStatus(Guid id, [FromBody] UpdateOPCRActivityEvaluationStatusRequest dto)
    {
        var command = new UpdateOPCRActivityEvaluationStatusCommand
        {
            Id = id,
            StatusString = dto.Status
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteOPCRActivityEvaluation(Guid id)
    {
        var command = new DeleteOPCRActivityEvaluationCommand(id);
        var result = await mediator.Send(command);

        return result.Succeeded ? NoContent() : NotFound();
    }
}
