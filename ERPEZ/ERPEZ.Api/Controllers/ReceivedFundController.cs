using ERPEZ.Application.Features.Planning.ReceivedFund.Commands.CreateReceivedFund;
using ERPEZ.Application.Features.Planning.ReceivedFund.Commands.DeleteReceivedFund;
using ERPEZ.Application.Features.Planning.ReceivedFund.Commands.UpdateReceivedFund;
using ERPEZ.Application.Features.Planning.ReceivedFund.Dtos;
using ERPEZ.Application.Features.Planning.ReceivedFund.Queries.GetReceivedFundById;
using ERPEZ.Application.Features.Planning.ReceivedFund.Queries.GetReceivedFunds;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("received-funds")]
    [ApiController]
    public class ReceivedFundController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateReceivedFund([FromBody] CreateReceivedFundCommand command)
        {
            var receivedFund = await mediator.Send(command);

            return receivedFund.Succeeded
                ? StatusCode(StatusCodes.Status201Created, receivedFund)
                : BadRequest(receivedFund);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<ReceivedFundResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetReceivedFunds([FromQuery] GetReceivedFundsQuery query)
        {
            var result = await mediator.Send(query);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<ReceivedFundResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetReceivedFundById(Guid id)
        {
            var receivedFund = await mediator.Send(new GetReceivedFundByIdQuery(id));
            return receivedFund.Succeeded ? Ok(receivedFund) : BadRequest(receivedFund);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateOffice(Guid id, [FromBody] UpdateReceivedFundRequest updateReceivedFund)
        {
            var request = new UpdateReceivedFundCommand
            {
                Id = id,
                UpdateReceivedFund = updateReceivedFund
            };

            var receivedFund = await mediator.Send(request);
            return receivedFund.Succeeded ? Ok(receivedFund) : BadRequest(receivedFund);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteReceivedFund(Guid id)
        {
            var command = new DeleteReceivedFundCommand(id);
            var receivedFund = await mediator.Send(command);

            return receivedFund.Succeeded ? Ok(receivedFund) : BadRequest(receivedFund);
        }
    }
}
