using Microsoft.AspNetCore.Authorization;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Authorization;
using ERPEZ.Application.Features.Planning.KPIModeOfVerification.Commands.CreateKPIModeOfVerification;
using ERPEZ.Application.Features.Planning.KPIModeOfVerification.Commands.DeleteKPIModeOfVerification;
using ERPEZ.Application.Features.Planning.KPIModeOfVerification.Commands.UpdateKPIModeOfVerification;
using ERPEZ.Application.Features.Planning.KPIModeOfVerification.Dtos;
using ERPEZ.Application.Features.Planning.KPIModeOfVerification.Queries.GetKPIModeOfVerificationById;
using ERPEZ.Application.Features.Planning.KPIModeOfVerification.Queries.GetKPIModeOfVerifications;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("kpi-mode-of-verifications")]
    [ApiController]
    [Authorize]
public class KPIModeOfVerificationController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<KPIModeOfVerificationResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<KPIModeOfVerificationResponse>), StatusCodes.Status400BadRequest)]
        [HasPermission(Permissions.Planning.kpiUpdate)]
        public async Task<IActionResult> CreateKPIModeOfVerification([FromBody] CreateKPIModeOfVerificationCommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetKPIModeOfVerificationById), new { id = result.Data }, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<KPIModeOfVerificationResponse>), StatusCodes.Status200OK)]
        [HasPermission(Permissions.Planning.kpiView)]
        public async Task<IActionResult> GetKPIModeOfVerifications([FromQuery] GetKPIModeOfVerificationsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<KPIModeOfVerificationResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HasPermission(Permissions.Planning.kpiView)]
        public async Task<IActionResult> GetKPIModeOfVerificationById(Guid id)
        {
            var result = await mediator.Send(new GetKPIModeOfVerificationByIdQuery(id));
            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<KPIModeOfVerificationResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HasPermission(Permissions.Planning.kpiUpdate)]
        public async Task<IActionResult> UpdateKPIModeOfVerification(Guid id, [FromBody] UpdateKPIModeOfVerificationRequest dto)
        {
            var command = new UpdateKPIModeOfVerificationCommand
            {
                Id = id,
                UpdateKPIModeOfVerification = dto
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HasPermission(Permissions.Planning.kpiUpdate)]
        public async Task<IActionResult> DeleteKPIModeOfVerification(Guid id)
        {
            var command = new DeleteKPIModeOfVerificationCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? NoContent() : BadRequest(result);
        }
    }
}
