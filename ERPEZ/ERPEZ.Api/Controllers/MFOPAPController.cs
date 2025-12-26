using ERPEZ.Application.Features.Planning.MFOPAP.Commands.CreateMFOPAP;
using ERPEZ.Application.Features.Planning.MFOPAP.Commands.DeleteMFOPAP;
using ERPEZ.Application.Features.Planning.MFOPAP.Commands.UpdateMFOPAP;
using ERPEZ.Application.Features.Planning.MFOPAP.Dtos;
using ERPEZ.Application.Features.Planning.MFOPAP.Queries.GetMFOPAPById;
using ERPEZ.Application.Features.Planning.MFOPAP.Queries.GetMFOPAPs;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("mfopaps")]
    [ApiController]
    public class MFOPAPController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateMFOPAP([FromBody] CreateMFOPAPCommand command)
        {
            var mfopap = await mediator.Send(command);

            return CreatedAtAction(nameof(GetMFOPAPById), new { id = mfopap.Data!.Id }, mfopap);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<MFOPAPResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetMFOPAPs([FromQuery] GetMFOPAPsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<MFOPAPDetailedResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetMFOPAPById(Guid id)
        {
            var mfopap = await mediator.Send(new GetMFOPAPByIdQuery(id));

            return mfopap.Succeeded ? Ok(mfopap) : BadRequest(mfopap);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
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
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteMFOPAP(Guid id)
        {
            var command = new DeleteMFOPAPCommand(id);
            var mfopap = await mediator.Send(command);

            return mfopap.Succeeded ? NoContent() : NotFound();
        }
    }
}
