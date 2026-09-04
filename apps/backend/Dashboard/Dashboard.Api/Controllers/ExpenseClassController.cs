using ERPEZ.Application.Features.Planning.ExpenseClass.Commands.CreateExpenseClass;
using ERPEZ.Application.Features.Planning.ExpenseClass.Commands.DeleteExpenseClass;
using ERPEZ.Application.Features.Planning.ExpenseClass.Commands.UpdateExpenseClass;
using ERPEZ.Application.Features.Planning.ExpenseClass.Dtos;
using ERPEZ.Application.Features.Planning.ExpenseClass.Queries.GetExpenseClassById;
using ERPEZ.Application.Features.Planning.ExpenseClass.Queries.GetExpenseClasses;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

/// <summary>
/// Controller for managing Expense Classes.
/// </summary>
[Route("expense-classes")]
[ApiController]
[Authorize]
public class ExpenseClassController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Creates a new Expense Class.
    /// </summary>
    [HttpPost]
    [HasPermission(Permissions.Finance.uacsManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateExpenseClass([FromBody] CreateExpenseClassCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetExpenseClassById), new { id = result.Data }, result);
    }

    /// <summary>
    /// Retrieves a paginated list of Expense Classes.
    /// </summary>
    [HttpGet]
    [HasPermission(Permissions.Finance.uacsView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<ExpenseClassResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetExpenseClasses([FromQuery] GetExpenseClassesQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves a single Expense Class by identifier.
    /// </summary>
    [HttpGet("{id}")]
    [HasPermission(Permissions.Finance.uacsView)]
    [ProducesResponseType(typeof(ApiResponse<ExpenseClassResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetExpenseClassById(Guid id)
    {
        var result = await mediator.Send(new GetExpenseClassByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Updates an existing Expense Class.
    /// </summary>
    [HttpPut("{id}")]
    [HasPermission(Permissions.Finance.uacsManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateExpenseClass(Guid id, [FromBody] UpdateExpenseClassRequest dto)
    {
        var command = new UpdateExpenseClassCommand
        {
            Id = id,
            Name = dto.Name,
            Code = dto.Code,
            Description = dto.Description,
            Type = dto.Type,
            IsActive = dto.IsActive
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Deletes an Expense Class.
    /// </summary>
    [HttpDelete("{id}")]
    [HasPermission(Permissions.Finance.uacsManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteExpenseClass(Guid id)
    {
        var result = await mediator.Send(new DeleteExpenseClassCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
