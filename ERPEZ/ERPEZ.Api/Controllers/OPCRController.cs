using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ERPEZ.Domain.Enums;
using ERPEZ.Application.Features.Planning.OPCR.Commands.CreateOPCR;
using ERPEZ.Application.Features.Planning.OPCR.Dtos;
using ERPEZ.Application.Features.Planning.OPCR.Queries.GetOPCRs;
using ERPEZ.Application.Features.Planning.OPCR.Queries.GetOPCRById;
using ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCR;
using ERPEZ.Application.Features.Planning.OPCR.Commands.DeleteOPCR;
using ERPEZ.Application.Features.Planning.OPCRActivityRating.Commands.UpdateOPCRRatingStatus;
using ERPEZ.Application.Features.Planning.OPCRActivityRating.Dtos;
using ERPEZ.Application.Features.Planning.OPCRItemRating.Commands.CreateOPCRItemRating;
using ERPEZ.Application.Features.Planning.OPCRItemRating.Commands.UpdateOPCRItemRating;
using ERPEZ.Application.Features.Planning.OPCRItemRating.Commands.DeleteOPCRItemRating;
using ERPEZ.Application.Features.Planning.OPCRItemMOV.Commands.CreateOPCRItemMOV;
using ERPEZ.Application.Features.Planning.OPCRItemMOV.Commands.UpdateOPCRItemMOV;
using ERPEZ.Application.Features.Planning.OPCRItemMOV.Commands.DeleteOPCRItemMOV;
using ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCRCommitmentStatus;
using ERPEZ.Application.Features.Planning.OPCR.Commands.UpdateOPCRReviewStatus;

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
            return result.Succeeded
                ? CreatedAtAction(nameof(GetOPCRById), new { id = result.Data }, result)
                : BadRequest(result);
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

        [HttpPatch("{id}/commitment-status")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateCommitmentStatus(
            Guid id,
            [FromBody] UpdateOPCRCommitmentStatusRequest request,
            CancellationToken cancellationToken)
        {
            var command = new UpdateOPCRCommitmentStatusCommand
            {
                Id = id,
                Request = request
            };

            var result = await mediator.Send(command, cancellationToken);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpPatch("{id}/review-status")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateReviewStatus(
            Guid id,
            [FromBody] UpdateOPCRReviewStatusRequest request,
            CancellationToken cancellationToken)
        {
            var command = new UpdateOPCRReviewStatusCommand
            {
                Id = id,
                Request = request
            };

            var result = await mediator.Send(command, cancellationToken);
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
                    Status = OPCRRatingStatus.Returned
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
            var result = await mediator.Send(new DeleteOPCRCommand(id));
            return result.Succeeded ? NoContent() : NotFound();
        }

                // =====================
        // OPCRItem Ratings
        // =====================

        [HttpPost("items/{itemId}/ratings")]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> CreateOPCRItemRating(
            Guid itemId,
            [FromBody] CreateOPCRItemRatingCommand command)
        {
            var result = await mediator.Send(command with { OPCRItemId = itemId });
            return result.Succeeded
                ? CreatedAtAction(nameof(GetOPCRById), new { id = itemId }, result)
                : BadRequest(result);
        }

        [HttpPut("items/ratings/{ratingId}")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateOPCRItemRating(
            Guid ratingId,
            [FromBody] UpdateOPCRItemRatingRequest request)
        {
            var command = new UpdateOPCRItemRatingCommand
            {
                Id = ratingId,
                UpdateOPCRItemRating = request
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("items/ratings/{ratingId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteOPCRItemRating(Guid ratingId)
        {
            var result = await mediator.Send(new DeleteOPCRItemRatingCommand(ratingId));
            return result.Succeeded ? NoContent() : NotFound();
        }

        // =====================
        // OPCRItem MOVs
        // =====================

        [HttpPost("items/{itemId}/movs")]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> CreateOPCRItemMOV(
            Guid itemId,
            [FromBody] CreateOPCRItemMOVCommand command)
        {
            var result = await mediator.Send(command with { OPCRItemId = itemId });
            return result.Succeeded
                ? CreatedAtAction(nameof(GetOPCRById), new { id = itemId }, result)
                : BadRequest(result);
        }

        [HttpPut("items/movs/{movId}")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateOPCRItemMOV(
            Guid movId,
            [FromBody] UpdateOPCRItemMOVRequest request)
        {
            var command = new UpdateOPCRItemMOVCommand
            {
                Id = movId,
                UpdateOPCRItemMOV = request
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("items/movs/{movId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteOPCRItemMOV(Guid movId)
        {
            var result = await mediator.Send(new DeleteOPCRItemMOVCommand(movId));
            return result.Succeeded ? NoContent() : NotFound();
        }
    }
}