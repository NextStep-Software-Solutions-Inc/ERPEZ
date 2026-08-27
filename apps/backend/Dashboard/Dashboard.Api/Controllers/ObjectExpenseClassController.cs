using ERPEZ.Application.Features.Planning.ObjectExpenseClass.Commands.CreateObjectExpenseClass;
using ERPEZ.Application.Features.Planning.ObjectExpenseClass.Commands.DeleteObjectExpenseClass;
using ERPEZ.Application.Features.Planning.ObjectExpenseClass.Commands.UpdateObjectExpenseClass;
using ERPEZ.Application.Features.Planning.ObjectExpenseClass.Dtos;
using ERPEZ.Application.Features.Planning.ObjectExpenseClass.Queries.GetObjectExpenseClassById;
using ERPEZ.Application.Features.Planning.ObjectExpenseClass.Queries.GetObjectExpenseClasses;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

/// <summary>
/// Controller for managing Object Expense Class mappings.
/// </summary>
[Route("object-expense-classes")]
[ApiController]
[Authorize]
public class ObjectExpenseClassController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Creates a new Object Expense Class mapping.
    /// </summary>
    [HttpPost]
    [HasPermission(Permissions.Finance.uacsManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateObjectExpenseClass([FromBody] CreateObjectExpenseClassCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetObjectExpenseClassById), new { id = result.Data }, result);
    }

    /// <summary>
    /// Retrieves a paginated list of Object Expense Class mappings.
    /// </summary>
    [HttpGet]
    [HasPermission(Permissions.Finance.uacsView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<ObjectExpenseClassResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetObjectExpenseClasses([FromQuery] GetObjectExpenseClassesQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves a single Object Expense Class mapping by identifier.
    /// </summary>
    [HttpGet("{id}")]
    [HasPermission(Permissions.Finance.uacsView)]
    [ProducesResponseType(typeof(ApiResponse<ObjectExpenseClassResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetObjectExpenseClassById(Guid id)
    {
        var result = await mediator.Send(new GetObjectExpenseClassByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Updates an existing Object Expense Class mapping.
    /// </summary>
    [HttpPut("{id}")]
    [HasPermission(Permissions.Finance.uacsManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateObjectExpenseClass(Guid id, [FromBody] UpdateObjectExpenseClassRequest dto)
    {
        var command = new UpdateObjectExpenseClassCommand
        {
            Id = id,
            ObjectId = dto.ObjectId,
            ExpenseClassId = dto.ExpenseClassId,
            Name = dto.Name,
            Description = dto.Description,
            IsActive = dto.IsActive
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Deletes an Object Expense Class mapping.
    /// </summary>
    [HttpDelete("{id}")]
    [HasPermission(Permissions.Finance.uacsManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteObjectExpenseClass(Guid id)
    {
        var result = await mediator.Send(new DeleteObjectExpenseClassCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
