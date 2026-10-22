using Microsoft.AspNetCore.Authorization;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Authorization;
using ERPEZ.Application.Features.Planning.OPCRConsolidation.Commands.CreateOPCRConsolidation;
using ERPEZ.Application.Features.Planning.OPCRConsolidation.Commands.DeleteOPCRConsolidation;
using ERPEZ.Application.Features.Planning.OPCRConsolidation.Commands.UpdateOPCRConsolidation;
using ERPEZ.Application.Features.Planning.OPCRConsolidation.Queries;
using ERPEZ.Application.Features.Planning.OPCRConsolidation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("opcr-consolidations")]
    [ApiController]
    [Authorize]
public class OPCRConsolidationController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status404NotFound)]
        [HasPermission(Permissions.Planning.opcrUpdate)]
        public async Task<IActionResult> CreateOPCRConsolidation(
            [FromBody] CreateOPCRConsolidationRequest request,
            CancellationToken cancellationToken)
        {
            var command = new CreateOPCRConsolidationCommand
            {
                Request = request
            };

            var result = await mediator.Send(command, cancellationToken);
            return result.Succeeded
                ? CreatedAtAction(nameof(GetOPCRConsolidationById), new { id = result.Data }, result)
                : BadRequest(result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<OPCRConsolidationsResponse>), StatusCodes.Status200OK)]
        [HasPermission(Permissions.Planning.opcrView)]
        public async Task<IActionResult> GetOPCRConsolidations([FromQuery] GetOPCRConsolidationsQuery query)
        {
            var result = await mediator.Send(query);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<OPCRConsolidationDetailedResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HasPermission(Permissions.Planning.opcrView)]
        public async Task<IActionResult> GetOPCRConsolidationById(Guid id)
        {
            var result = await mediator.Send(new GetOPCRConsolidationByIdQuery(id));
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPatch("{id}/name")]
        [HasPermission(Permissions.Planning.opcrUpdate)]
        public async Task<IActionResult> UpdateName(
            Guid id,
            [FromBody] UpdateOPCRConsolidationNameRequest request,
            CancellationToken cancellationToken)
        {
            var result = await mediator.Send(
                new UpdateOPCRConsolidationNameCommand { Id = id, Request = request },
                cancellationToken);

            return Ok(result);
}

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HasPermission(Permissions.Planning.opcrUpdate)]
        public async Task<IActionResult> DeleteOPCRConsolidation(Guid id)
        {
            var result = await mediator.Send(new DeleteOPCRConsolidationCommand(id));
            return result.Succeeded ? NoContent() : NotFound();
}
    }
}