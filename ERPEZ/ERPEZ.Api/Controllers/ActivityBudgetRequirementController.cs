using ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Commands.CreateABR;
using ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Commands.DeleteABR;
using ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Commands.UpdateABR;
using ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Dtos;
using ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Queries.GetABRById;
using ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Queries.GetABRs;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("activity-budget-requirements")]
    [ApiController]
    public class ActivityBudgetRequirementController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<ActivityBudgetRequirementResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<ActivityBudgetRequirementResponse>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateActivityBudgetRequirement([FromBody] CreateActivityBudgetRequirementCommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetActivityBudgetRequirementById), new { id = result.Data!.Id }, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<ActivityBudgetRequirementResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetActivityBudgetRequirements([FromQuery] GetActivityBudgetRequirementsQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<ActivityBudgetRequirementResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetActivityBudgetRequirementById(Guid id)
        {
            var result = await mediator.Send(new GetActivityBudgetRequirementByIdQuery(id));

            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<ActivityBudgetRequirementResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateActivityBudgetRequirement(Guid id, [FromBody] UpdateActivityBudgetRequirementRequest dto)
        {
            var command = new UpdateActivityBudgetRequirementCommand
            {
                Id = id,
                UpdateActivityBudgetRequirement = dto
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteActivityBudgetRequirement(Guid id)
        {
            var command = new DeleteActivityBudgetRequirementCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? Ok(result) : BadRequest(result);
        }
    }
}
