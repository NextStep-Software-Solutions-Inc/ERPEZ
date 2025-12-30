using ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Commands.CreateWFPObjectiveTargetExpenditure;
using ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Commands.DeleteWFPObjectiveTargetExpenditure;
using ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Commands.UpdateWFPObjectiveTargetExpenditure;
using ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Dtos;
using ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Queries.GetWFPObjectiveTargetExpenditureById;
using ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Queries.GetWFPObjectiveTargetExpenditures;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("wfp-objective-target-expenditures")]
    [ApiController]
    public class WFPObjectiveTargetExpenditureController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<WFPObjectiveTargetExpenditureResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<WFPObjectiveTargetExpenditureResponse>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateWFPObjectiveTargetExpenditure([FromBody] CreateWFPObjectiveTargetExpenditureCommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetWFPObjectiveTargetExpenditureById), new { id = result.Data!.Id }, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<WFPObjectiveTargetExpenditureResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetWFPObjectiveTargetExpenditures([FromQuery] GetWFPObjectiveTargetExpendituresQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<WFPObjectiveTargetExpenditureResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetWFPObjectiveTargetExpenditureById(Guid id)
        {
            var result = await mediator.Send(new GetWFPObjectiveTargetExpenditureByIdQuery(id));

            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<WFPObjectiveTargetExpenditureResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateWFPObjectiveTargetExpenditure(Guid id, [FromBody] UpdateWFPObjectiveTargetExpenditureRequest dto)
        {
            var command = new UpdateWFPObjectiveTargetExpenditureCommand
            {
                Id = id,
                UpdateWFPObjectiveTargetExpenditure = dto
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteWFPObjectiveTargetExpenditure(Guid id)
        {
            var command = new DeleteWFPObjectiveTargetExpenditureCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? NoContent() : BadRequest(result);
        }
    }
}
