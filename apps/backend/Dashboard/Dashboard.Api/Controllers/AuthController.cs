using ERPEZ.Application.Features.Auth.Queries.GetCurrentUserPermissions;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("auth")]
[ApiController]
[Authorize]
public class AuthController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Returns the active functional permissions granted to the currently authenticated user within the active tenant.
    /// </summary>
    [HttpGet("me/permissions")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlySet<string>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyPermissions()
    {
        var result = await mediator.Send(new GetCurrentUserPermissionsQuery());
        return Ok(result);
    }
}
