using ERPEZ.Application.Features.Planning.WorkflowMatrix.Commands.CreateWorkflowMatrix;
using ERPEZ.Application.Features.Planning.WorkflowMatrix.Commands.DeleteWorkflowMatrix;
using ERPEZ.Application.Features.Planning.WorkflowMatrix.Commands.UpdateWorkflowMatrix;
using ERPEZ.Application.Features.Planning.WorkflowMatrix.Dtos;
using ERPEZ.Application.Features.Planning.WorkflowMatrix.Queries.GetWorkflowMatrices;
using ERPEZ.Application.Features.Planning.WorkflowMatrix.Queries.GetWorkflowMatrixById;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("workflow-matrices")]
[ApiController]
public class WorkflowMatrixController(ISender mediator) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<WorkflowMatrixResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWorkflowMatrices([FromQuery] GetWorkflowMatricesQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<WorkflowMatrixResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<WorkflowMatrixResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetWorkflowMatrixById(Guid id)
    {
        var result = await mediator.Send(new GetWorkflowMatrixByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateWorkflowMatrix([FromBody] CreateWorkflowMatrixCommand command)
    {
        var result = await mediator.Send(command);

        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetWorkflowMatrixById), new { id = result.Data }, result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateWorkflowMatrix(Guid id, [FromBody] UpdateWorkflowMatrixRequest request)
    {
        var command = new UpdateWorkflowMatrixCommand
        {
            Id = id,
            DocumentType = request.DocumentType
        };

        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteWorkflowMatrix(Guid id)
    {
        var result = await mediator.Send(new DeleteWorkflowMatrixCommand(id));

        if (!result.Succeeded)
            return NotFound(result);

        return NoContent();
    }
}
