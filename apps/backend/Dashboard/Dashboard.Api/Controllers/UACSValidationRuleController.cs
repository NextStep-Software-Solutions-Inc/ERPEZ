using ERPEZ.Application.Features.Planning.UACSValidationRule.Commands.CreateUACSValidationRule;
using ERPEZ.Application.Features.Planning.UACSValidationRule.Commands.DeleteUACSValidationRule;
using ERPEZ.Application.Features.Planning.UACSValidationRule.Commands.UpdateUACSValidationRule;
using ERPEZ.Application.Features.Planning.UACSValidationRule.Dtos;
using ERPEZ.Application.Features.Planning.UACSValidationRule.Queries.GetUACSValidationRuleById;
using ERPEZ.Application.Features.Planning.UACSValidationRule.Queries.GetUACSValidationRules;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    [Route("uacs-validation-rules")]
    [ApiController]
    [Authorize]
    public class UACSValidationRulesController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [HasPermission(Permissions.Finance.uacsManage)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> CreateUACSValidationRule([FromBody] CreateUACSValidationRuleCommand command)
        {
            var response = await mediator.Send(command);

            if (!response.Succeeded)
                return BadRequest(response);

            return CreatedAtAction(nameof(GetUACSValidationRuleById), new { id = response.Data }, response);
        }

        [HttpGet]
        [HasPermission(Permissions.Finance.uacsView)]
        [ProducesResponseType(typeof(PaginatedApiResponse<UACSValidationRuleResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetUACSValidationRules([FromQuery] GetUACSValidationRulesQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [HasPermission(Permissions.Finance.uacsView)]
        [ProducesResponseType(typeof(ApiResponse<UACSValidationRuleResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetUACSValidationRuleById(Guid id)
        {
            var response = await mediator.Send(new GetUACSValidationRuleByIdQuery(id));
            return response.Succeeded ? Ok(response) : BadRequest(response);
        }

        [HttpPut("{id}")]
        [HasPermission(Permissions.Finance.uacsManage)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> UpdateUACSValidationRule(Guid id, [FromBody] UpdateUACSValidationRuleRequest updateUACSValidationRule)
        {
            var request = new UpdateUACSValidationRuleCommand
            {
                Id = id,
                UpdateUACSValidationRule = updateUACSValidationRule
            };

            var response = await mediator.Send(request);
            return response.Succeeded ? Ok(response) : BadRequest(response);
        }

        [HttpDelete("{id}")]
        [HasPermission(Permissions.Finance.uacsManage)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> DeleteUACSValidationRule(Guid id)
        {
            var command = new DeleteUACSValidationRuleCommand(id);
            var response = await mediator.Send(command);

            return response.Succeeded ? Ok(response) : BadRequest(response);
        }
    }
}
