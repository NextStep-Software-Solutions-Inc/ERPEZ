using ERPEZ.Application.Features.Planning.User.Commands.CreateUser;
using ERPEZ.Application.Features.Planning.User.Commands.DeleteUser;
using ERPEZ.Application.Features.Planning.User.Commands.UpdateUser;
using ERPEZ.Application.Features.Planning.User.Dtos;
using ERPEZ.Application.Features.Planning.User.Queries.GetUserById;
using ERPEZ.Application.Features.Planning.User.Queries.GetUsers;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("users")]
[ApiController]
public class UserController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetUserById), new { id = result.Data }, result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<UserResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUsers([FromQuery] GetUsersQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<UserResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserById(Guid id)
    {
        var result = await mediator.Send(new GetUserByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest updateUser)
    {
        var request = new UpdateUserCommand
        {
            Id = id,
            UpdateUser = updateUser
        };

        var result = await mediator.Send(request);
        return result.Succeeded ? Ok(ApiResponse<Unit>.Success(Unit.Value)) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var result = await mediator.Send(new DeleteUserCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
