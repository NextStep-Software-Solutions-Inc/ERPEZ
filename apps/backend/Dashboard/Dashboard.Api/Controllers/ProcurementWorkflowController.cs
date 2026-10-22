using ERPEZ.Application.Features.Planning.ProcurementWorkflow.Commands.CreateProcurementWorkflow;
using ERPEZ.Application.Features.Planning.ProcurementWorkflow.Commands.DeleteProcurementWorkflow;
using ERPEZ.Application.Features.Planning.ProcurementWorkflow.Commands.UpdateProcurementWorkflow;
using ERPEZ.Application.Features.Planning.ProcurementWorkflow.Dtos;
using ERPEZ.Application.Features.Planning.ProcurementWorkflow.Queries.GetProcurementWorkflowById;
using ERPEZ.Application.Features.Planning.ProcurementWorkflow.Queries.GetProcurementWorkflows;
using ERPEZ.Shared.Authorization;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("procurement-workflows")]
[ApiController]
[Authorize]
public class ProcurementWorkflowController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [HasPermission(Permissions.Admin.orgStructureManage)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateProcurementWorkflow([FromBody] CreateProcurementWorkflowCommand command)
    {
        var result = await mediator.Send(command);
        return !result.Succeeded ? BadRequest(result) : CreatedAtAction(nameof(GetProcurementWorkflowById), new { id = result.Data }, result);
    }

    [HttpGet]
    [HasPermission(Permissions.Admin.orgStructureView)]
    [ProducesResponseType(typeof(PaginatedApiResponse<ProcurementWorkflowResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetProcurementWorkflows([FromQuery] GetProcurementWorkflowsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [HasPermission(Permissions.Admin.orgStructureView)]
    [ProducesResponseType(typeof(ApiResponse<ProcurementWorkflowResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetProcurementWorkflowById(Guid id)
    {
        var result = await mediator.Send(new GetProcurementWorkflowByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [HasPermission(Permissions.Admin.orgStructureManage)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateProcurementWorkflow(Guid id, [FromBody] UpdateProcurementWorkflowRequest updateProcurementWorkflow)
    {
        var request = new UpdateProcurementWorkflowCommand
        {
            Id = id,
            UpdateProcurementWorkflow = updateProcurementWorkflow
        };

        var result = await mediator.Send(request);
        return result.Succeeded ? Ok(ApiResponse<Unit>.Success(Unit.Value)) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [HasPermission(Permissions.Admin.orgStructureManage)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteProcurementWorkflow(Guid id)
    {
        var result = await mediator.Send(new DeleteProcurementWorkflowCommand(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }
}
