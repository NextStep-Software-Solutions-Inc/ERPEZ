using ERPEZ.Application.Features.Core.UserPINs.Commands.CreateUserPIN;
using ERPEZ.Application.Features.Core.UserPINs.Commands.DeleteUserPIN;
using ERPEZ.Application.Features.Core.UserPINs.Commands.UpdateUserPIN;
using ERPEZ.Application.Features.Core.UserPINs.Queries.GetUserPIN;
using ERPEZ.Domain.Dtos.Core;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

/// <summary>
/// Controller for managing user PINs for transaction authorization.
/// </summary>
[Authorize]
[ApiController]
[Route("user-pins")]
public class UserPINController(IMediator mediator) : ControllerBase
{
    /// <summary>
    /// Create a new PIN for the authenticated user.
    /// </summary>
    /// <param name="request">The PIN creation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created PIN.</returns>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateUserPIN([FromBody] CreateUserPINRequest request, CancellationToken cancellationToken)
    {
        var command = new CreateUserPINCommand
        {
            PIN = request.PIN,
            ExpiresAt = request.ExpiresAt
        };

        var result = await mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetUserPIN), new { }, result);
    }

    /// <summary>
    /// Get the authenticated user's PIN status.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The user's PIN status.</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserPIN(CancellationToken cancellationToken)
    {
        var query = new GetUserPINQuery();
        var result = await mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Update the authenticated user's PIN.
    /// </summary>
    /// <param name="request">The PIN update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Success message.</returns>
    [HttpPut]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUserPIN(
        [FromBody] UpdateUserPINRequest request,
        CancellationToken cancellationToken)
    {
        var command = new UpdateUserPINCommand
        {
            CurrentPIN = request.CurrentPIN,
            NewPIN = request.NewPIN,
            ExpiresAt = request.ExpiresAt
        };

        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Delete the authenticated user's PIN.
    /// </summary>
    /// <param name="currentPIN">The current PIN for verification.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Success message.</returns>
    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUserPIN([FromQuery] string currentPIN, CancellationToken cancellationToken)
    {
        var command = new DeleteUserPINCommand
        {
            CurrentPIN = currentPIN
        };

        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }
}
