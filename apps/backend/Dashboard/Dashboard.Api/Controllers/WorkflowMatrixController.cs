using ERPEZ.Application.Features.Planning.WorkflowMatrix.Commands.CreateWorkflowMatrix;
using ERPEZ.Application.Features.Planning.WorkflowMatrix.Commands.DeleteWorkflowMatrix;
using ERPEZ.Application.Features.Planning.WorkflowMatrix.Commands.UpdateWorkflowMatrix;
using ERPEZ.Application.Features.Planning.WorkflowMatrix.Commands.UpdateWorkflowMatrixStatus;
using ERPEZ.Application.Features.Planning.WorkflowMatrix.Dtos;
using ERPEZ.Application.Features.Planning.WorkflowMatrix.Queries.ResolveWorkflowMatrixApprovers;
using ERPEZ.Application.Features.Planning.WorkflowMatrix.Queries.GetWorkflowMatrices;
using ERPEZ.Application.Features.Planning.WorkflowMatrix.Queries.GetWorkflowMatrixById;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("workflow-matrices")]
[ApiController]
public class WorkflowMatrixController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [HasPermission(Permissions.Planning.workflowMatrixManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateWorkflowMatrix([FromBody] CreateWorkflowMatrixCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetWorkflowMatrixById), new { id = result.Data }, result);
    }

    [HttpPost("resolve-approvers")]
    [HasPermission(Permissions.Planning.workflowMatrixManage)]
    [ProducesResponseType(typeof(ApiResponse<ResolveWorkflowMatrixApproversResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ResolveWorkflowMatrixApproversResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<ResolveWorkflowMatrixApproversResponse>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<ResolveWorkflowMatrixApproversResponse>), StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ResolveApprovers([FromBody] ResolveWorkflowMatrixApproversRequest request)
    {
        var query = new ResolveWorkflowMatrixApproversQuery
        {
            OfficeId = request.OfficeId,
            RecommendingApproverUserId = request.RecommendingApproverUserId,
            FinalApproverUserId = request.FinalApproverUserId
        };

        var result = await mediator.Send(query);
        return Ok(result);
    }
    
    [HttpGet]
    [HasPermission(Permissions.Planning.workflowMatrixManage)]
    [ProducesResponseType(typeof(PaginatedApiResponse<WorkflowMatrixResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetWorkflowMatrices([FromQuery] GetWorkflowMatricesQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.Planning.workflowMatrixManage)]
    [ProducesResponseType(typeof(ApiResponse<WorkflowMatrixResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<WorkflowMatrixResponse>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetWorkflowMatrixById(Guid id)
    {
        var result = await mediator.Send(new GetWorkflowMatrixByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.Planning.workflowMatrixManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateWorkflowMatrix(Guid id, [FromBody] UpdateWorkflowMatrixRequest request)
    {
        var command = new UpdateWorkflowMatrixCommand
        {
            Id = id,
            DocumentType = request.DocumentType,
            RecommendingApproverPositionId = request.RecommendingApproverPositionId,
            FinalApproverPositionId = request.FinalApproverPositionId
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpDelete("{id:guid}")]
    [HasPermission(Permissions.Planning.workflowMatrixManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteWorkflowMatrix(Guid id)
    {
        var result = await mediator.Send(new DeleteWorkflowMatrixCommand(id));

        if (!result.Succeeded)
            return NotFound(result);

        return NoContent();
    }

    [HttpPatch("{id:guid}/status")]
    [HasPermission(Permissions.Planning.workflowMatrixManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateWorkflowMatrixStatus(Guid id, [FromBody] UpdateWorkflowMatrixStatusRequest request)
    {
        var command = new UpdateWorkflowMatrixStatusCommand
        {
            Id = id,
            Status = request.Status
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
