using Microsoft.AspNetCore.Authorization;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Authorization;
using ERPEZ.Application.Features.Planning.KPIAssignment.Commands.CreateKPIAssignment;
using ERPEZ.Application.Features.Planning.KPIAssignment.Commands.BulkCreateKPIAssignment;
using ERPEZ.Application.Features.Planning.KPIAssignment.Commands.BulkUpdateKPIAssignmentLockStatus;
using ERPEZ.Application.Features.Planning.KPIAssignment.Commands.UpdateKPIAssignment;
using ERPEZ.Application.Features.Planning.KPIAssignment.Commands.DeleteKPIAssignment;
using ERPEZ.Application.Features.Planning.KPIAssignment.Dtos;
using ERPEZ.Application.Features.Planning.KPIAssignment.Queries.GetKPIAssignments;
using ERPEZ.Application.Features.Planning.KPIAssignment.Queries.GetKPIAssignmentById;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("kpi-assignments")]
[ApiController]
[Authorize]
public class KPIAssignmentController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Creates a KPI Assignment (Level 2 - Office Target Distribution)
    /// Validates distribution behavior (Divisible, Uniform, Maximum, Minimum, Milestone)
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [HasPermission(Permissions.Planning.kpiAssign)]
    public async Task<IActionResult> CreateKPIAssignment([FromBody] CreateKPIAssignmentCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetKPIAssignmentById), new { id = result.Data }, result);
    }

    /// <summary>
    /// Bulk assign KPIs to multiple offices (Level 2 - Office Target Distribution)
    /// Assigns multiple offices per KPI in a single transaction.
    /// Validates distribution behavior for each KPI.
    /// </summary>
    [HttpPost("bulk")]
    [ProducesResponseType(typeof(ApiResponse<BulkAssignmentResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<BulkAssignmentResult>), StatusCodes.Status400BadRequest)]
    [HasPermission(Permissions.Planning.kpiAssign)]
    public async Task<IActionResult> BulkCreateKPIAssignment([FromBody] List<KPIOfficeAssignmentRequest> assignments)
    {
        var command = new BulkCreateKPIAssignmentCommand(assignments);
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Bulk update lock/unlock status for existing KPI assignments.
    /// Updates IsLocked per office assignment for each FYActiveKPI.
    /// </summary>
    [HttpPut("lock-status/bulk")]
    [ProducesResponseType(typeof(ApiResponse<BulkLockStatusUpdateResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<BulkLockStatusUpdateResult>), StatusCodes.Status400BadRequest)]
    [HasPermission(Permissions.Planning.kpiAssign)]
    public async Task<IActionResult> BulkUpdateKPIAssignmentLockStatus([FromBody] List<KPIOfficeLockStatusRequest> assignments)
    {
        var command = new BulkUpdateKPIAssignmentLockStatusCommand(assignments);
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Gets all KPI Assignments with pagination and filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<KPIAssignmentResponse>), StatusCodes.Status200OK)]
    [HasPermission(Permissions.Planning.kpiView)]
    public async Task<IActionResult> GetKPIAssignments([FromQuery] GetKPIAssignmentsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<KPIAssignmentResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<KPIAssignmentResponse>), StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Planning.kpiView)]
    public async Task<IActionResult> GetKPIAssignmentById(Guid id)
    {
        var result = await mediator.Send(new GetKPIAssignmentByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Planning.kpiAssign)]
    public async Task<IActionResult> UpdateKPIAssignment(Guid id, [FromBody] UpdateKPIAssignmentCommand command)
    {
        var request = command with { Id = id };
        var result = await mediator.Send(request);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    [HasPermission(Permissions.Planning.kpiAssign)]
    public async Task<IActionResult> DeleteKPIAssignment(Guid id)
    {
        var result = await mediator.Send(new DeleteKPIAssignmentCommand(id));

        if (!result.Succeeded)
            return NotFound(result);

        return NoContent();
    }
}
