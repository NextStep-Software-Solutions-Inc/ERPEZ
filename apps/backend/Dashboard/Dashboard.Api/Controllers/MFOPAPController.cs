using ERPEZ.Application.Features.Planning.MFOPAP.Commands.CreateMFOPAP;
using ERPEZ.Application.Features.Planning.MFOPAP.Commands.DeleteMFOPAP;
using ERPEZ.Application.Features.Planning.MFOPAP.Commands.UpdateMFOPAP;
using ERPEZ.Application.Features.Planning.MFOPAP.Dtos;
using ERPEZ.Application.Features.Planning.MFOPAP.Queries.GetMFOPAPById;
using ERPEZ.Application.Features.Planning.MFOPAP.Queries.GetMFOPAPs;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("mfopaps")]
    [ApiController]
    [Authorize]
    public class MFOPAPController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [HasPermission(Permissions.Finance.uacsManage)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> CreateMFOPAP([FromBody] CreateMFOPAPCommand command)
        {
            var mfopap = await mediator.Send(command);

            return CreatedAtAction(nameof(GetMFOPAPById), new { id = mfopap.Data }, mfopap);
        }

        [HttpGet]
        [HasPermission(Permissions.Finance.uacsView)]
        [ProducesResponseType(typeof(PaginatedApiResponse<MFOPAPResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetMFOPAPs([FromQuery] GetMFOPAPsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [HasPermission(Permissions.Finance.uacsView)]
        [ProducesResponseType(typeof(ApiResponse<MFOPAPDetailedResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetMFOPAPById(Guid id)
        {
            var mfopap = await mediator.Send(new GetMFOPAPByIdQuery(id));

            return mfopap.Succeeded ? Ok(mfopap) : BadRequest(mfopap);
        }

        [HttpPut("{id}")]
        [HasPermission(Permissions.Finance.uacsManage)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> UpdateMFOPAP(Guid id, [FromBody] UpdateMFOPAPRequest updateMFOPAP)
        {
            var request = new UpdateMFOPAPCommand
            {
                Id = id,
                UpdateMFOPAP = updateMFOPAP
            };

            var mfopap = await mediator.Send(request);
            return mfopap.Succeeded ? Ok(ApiResponse<Unit>.Success(Unit.Value)) : BadRequest(mfopap);
        }

        [HttpDelete("{id}")]
        [HasPermission(Permissions.Finance.uacsManage)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> DeleteMFOPAP(Guid id)
        {
            var command = new DeleteMFOPAPCommand(id);
            var mfopap = await mediator.Send(command);

            return mfopap.Succeeded ? NoContent() : NotFound();
        }
    }
}
