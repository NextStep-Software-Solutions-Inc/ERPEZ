using ERPEZ.Application.Features.Planning.OPCREvaluation.Commands.CreateOPCREvaluation;
using ERPEZ.Application.Features.Planning.OPCREvaluation.Commands.DeleteOPCREvaluation;
using ERPEZ.Application.Features.Planning.OPCREvaluation.Commands.UpdateOPCREvaluation;
using ERPEZ.Application.Features.Planning.OPCREvaluation.Dtos;
using ERPEZ.Application.Features.Planning.OPCREvaluation.Queries.GetOPCREvaluationById;
using ERPEZ.Application.Features.Planning.OPCREvaluation.Queries.GetOPCREvaluations;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("opcr-evaluations")]
    [ApiController]
    public class OPCREvaluationController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<OPCREvaluationDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<OPCREvaluationDto>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateOPCREvaluation([FromBody] CreateOPCREvaluationCommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            // Returns 201 Created and links to the GetById endpoint, returning the DTO
            return CreatedAtAction(nameof(GetOPCREvaluationById), new { id = result.Data!.Id }, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<OPCREvaluationDto>), StatusCodes.Status200OK)] // Returns DTO
        public async Task<IActionResult> GetOPCREvaluations([FromQuery] GetOPCREvaluationsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<OPCREvaluation>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetOPCREvaluationById(Guid id)
        {
            var result = await mediator.Send(new GetOPCREvaluationByIdQuery(id));

            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<OPCREvaluationDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateOPCREvaluation(Guid id, [FromBody] UpdateOPCREvaluationDto dto)
        {
            var command = new UpdateOPCREvaluationCommand
            {
                Id = id,
                UpdateOPCREvaluation = dto
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteOPCREvaluation(Guid id)
        {
            var command = new DeleteOPCREvaluationCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? NoContent() : BadRequest(result);
        }
    }
}