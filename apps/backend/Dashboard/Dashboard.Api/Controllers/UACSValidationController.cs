using ERPEZ.Application.Features.Planning.UACSValidation.Commands.ValidateUACSCombination;
using ERPEZ.Application.Features.Planning.UACSValidation.Dtos;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

/// <summary>
/// Controller for UACS validation operations.
/// </summary>
[Route("uacs")]
[ApiController]
[Authorize]
public class UACSValidationController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Validates a UACS code combination against all applicable rules.
    /// </summary>
    /// <param name="command">The 5-element code combination to validate.</param>
    /// <returns>Validation result with applicable rules and feedback.</returns>
    [HttpPost("validate-combination")]
    [HasPermission(Permissions.Finance.uacsView)]
    [ProducesResponseType(typeof(ApiResponse<UACSValidationResultResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<UACSValidationResultResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ValidateCombination([FromBody] ValidateUACSCombinationCommand command)
    {
        var response = await mediator.Send(command);
        return response.Succeeded ? Ok(response) : BadRequest(response);
    }
}
