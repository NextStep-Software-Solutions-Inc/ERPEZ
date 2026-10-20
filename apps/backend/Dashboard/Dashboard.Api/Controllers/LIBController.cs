using ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.ApproveLIB;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.CreateLIB;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.DeleteLIB;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.LinkCeilingToLIB;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.ReturnLIB;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.SubmitLIB;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.UpdateLIB;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.UpdateLIBStatus;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Queries.GetLIBById;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Queries.GetLIBs;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Queries.GetLIBSummary;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Queries.GetLIBVersionHistory;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ERPEZ.Api.Attributes;

namespace ERPEZ.Api.Controllers;

[Route("libs")]
[ApiController]
[Authorize]
[RequireModule("pbms")]
public class LIBController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [HasPermission(Permissions.Planning.libCreate)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateLIB([FromBody] CreateLIBRequest request)
    {
        var result = await mediator.Send(new CreateLIBCommand(request));
        return result.Succeeded
            ? CreatedAtAction(nameof(GetLIBById), new { id = result.Data }, result)
            : BadRequest(result);
    }

    [HttpGet]
    [HasPermission(Permissions.Planning.libView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<LIBResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetLIBs([FromQuery] GetLIBsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.Planning.libView)]
    [ProducesResponseType(typeof(ApiResponse<LIBResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetLIBById(Guid id)
    {
        var result = await mediator.Send(new GetLIBByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [HasPermission(Permissions.Planning.libUpdate)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateLIB(Guid id, [FromBody] UpdateLIBRequest request)
    {
        var command = new UpdateLIBCommand(id, request);
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPut("{id}/submit")]
    [HasPermission(Permissions.Planning.libSubmit)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> SubmitLIB(Guid id)
    {
        var result = await mediator.Send(new SubmitLIBCommand(id));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPut("{id}/approve")]
    [HasPermission(Permissions.Planning.libApprove)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ApproveLIB(Guid id, [FromQuery] bool isFinalApproval = true)
    {
        var result = await mediator.Send(new ApproveLIBCommand(id, isFinalApproval));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPut("{id}/return")]
    [HasPermission(Permissions.Planning.libApprove)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ReturnLIB(Guid id, [FromBody] string? reason = null)
    {
        var result = await mediator.Send(new ReturnLIBCommand(id, reason));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPut("{id}/status")]
    [HasPermission(Permissions.Planning.libUpdate)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateLIBStatus(Guid id, [FromBody] UpdateLIBStatusRequest request)
    {
        var result = await mediator.Send(new UpdateLIBStatusCommand(id, request.Status));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpGet("{id}/summary")]
    [HasPermission(Permissions.Planning.libView)]
    [ProducesResponseType(typeof(ApiResponse<LIBDashboardSummaryResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetLIBSummary(Guid id)
    {
        var result = await mediator.Send(new GetLIBSummaryQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpGet("{id}/history")]
    [HasPermission(Permissions.Planning.libView)]
    [ProducesResponseType(typeof(ApiResponse<List<LIBVersionHistoryResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetLIBVersionHistory(Guid id)
    {
        var result = await mediator.Send(new GetLIBVersionHistoryQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPatch("{id}/link-ceiling")]
    [HasPermission(Permissions.Finance.budgetCeilingAssign)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> LinkCeilingToLIB(Guid id, [FromBody] LinkCeilingToLIBRequest request)
    {
        var result = await mediator.Send(new LinkCeilingToLIBCommand(id, request.AgencyMasterBudgetId));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.Planning.libDelete)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteLIB(Guid id)
    {
        var result = await mediator.Send(new DeleteLIBCommand(id));
        return result.Succeeded ? NoContent() : NotFound();
    }
}
