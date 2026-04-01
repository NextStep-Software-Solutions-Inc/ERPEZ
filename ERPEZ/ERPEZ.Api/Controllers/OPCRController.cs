using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Application.Features.Planning.OPCR.Commands.CreateOPCR;
using ERPEZ.Application.Features.Planning.OPCR.Dtos;
using ERPEZ.Application.Features.Planning.OPCR.Queries.GetOPCRs;
using ERPEZ.Application.Features.Planning.OPCR.Queries.GetOPCRById;
using ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCR;
using ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCRStatus;
using ERPEZ.Application.Features.Planning.OPCR.Commands.DeleteOPCR;
using ERPEZ.Application.Features.Planning.OPCRActivityRating.Commands.UpdateOPCRRatingStatus;
using ERPEZ.Application.Features.Planning.OPCRActivityRating.Dtos;

namespace ERPEZ.Api.Controllers
{
    [Route("opcrs")]
    [ApiController]
    public class OPCRController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateOPCR([FromBody] CreateOPCRCommand command)
        {
            var result = await mediator.Send(command);
            return result.Succeeded ? CreatedAtAction(nameof(GetOPCRById), new { id = result.Data }, result) : BadRequest(result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<OPCRsResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetOPCRs([FromQuery] GetOPCRsQuery query)
        {
            var result = await mediator.Send(query);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<OPCRDetailedResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetOPCRById(Guid id)
        {
            var result = await mediator.Send(new GetOPCRByIdQuery(id));
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateOPCR(Guid id, [FromBody] UpdateOPCRRequest dto)
        {
            var command = new UpdateOPCRCommand
            {
                Id = id,
                UpdateOPCR = dto
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(ApiResponse<Unit>.Success(Unit.Value)) : BadRequest(result);
        }

        [HttpPut("{id}/status")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateOPCRStatus(Guid id, [FromBody] UpdateOPCRStatusRequest dto)
        {
            var command = new UpdateOPCRStatusCommand
            {
                Id = id,
                UpdateOPCRStatus = dto
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpPost("{id}/rating/submit")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SubmitOPCRRating(Guid id)
        {
            var command = new UpdateOPCRRatingStatusCommand
            {
                Id = id,
                UpdateStatus = new UpdateOPCRRatingStatusRequest
                {
                    Status = OPCRRatingStatus.Submitted
                }
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpPost("{id}/rating/return")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ReturnOPCRRating(Guid id)
        {
            var command = new UpdateOPCRRatingStatusCommand
            {
                Id = id,
                UpdateStatus = new UpdateOPCRRatingStatusRequest
                {
                    Status = OPCRRatingStatus.Returned,
                }
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteOPCR(Guid id)
        {
            var command = new DeleteOPCRCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? NoContent() : NotFound();
        }
    }
}
