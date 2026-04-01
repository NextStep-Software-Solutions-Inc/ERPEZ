using ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Commands.CreateWFPObjectiveActivityExpenditure;
using ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Commands.DeleteWFPObjectiveActivityExpenditure;
using ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Commands.UpdateWFPObjectiveActivityExpenditure;
using ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Queries.GetWFPObjectiveActivityExpenditureById;
using ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Queries.GetWFPObjectiveActivityExpenditures;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("wfp-objective-activity-expenditures")]
    [ApiController]
    public class WFPObjectiveActivityExpenditureController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateWFPObjectiveActivityExpenditure([FromBody] CreateWFPObjectiveActivityExpenditureCommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetWFPObjectiveActivityExpenditureById), new { id = result.Data }, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<WFPObjectiveActivityExpenditureResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetWFPObjectiveActivityExpenditures([FromQuery] GetWFPObjectiveActivityExpendituresQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<WFPObjectiveActivityExpenditureResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetWFPObjectiveActivityExpenditureById(Guid id)
        {
            var result = await mediator.Send(new GetWFPObjectiveActivityExpenditureByIdQuery(id));

            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateWFPObjectiveActivityExpenditure(Guid id, [FromBody] UpdateWFPObjectiveActivityExpenditureRequest dto)
        {
            var command = new UpdateWFPObjectiveActivityExpenditureCommand
            {
                Id = id,
                UpdateWFPObjectiveActivityExpenditure = dto
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteWFPObjectiveActivityExpenditure(Guid id)
        {
            var command = new DeleteWFPObjectiveActivityExpenditureCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? NoContent() : BadRequest(result);
        }
    }
}
