using ERPEZ.Application.Features.Planning.BudgetCall.Commands.ChangeBudgetCallStatus;
using ERPEZ.Application.Features.Planning.BudgetCall.Commands.CreateBudgetCall;
using ERPEZ.Application.Features.Planning.BudgetCall.Commands.DeleteBudgetCall;
using ERPEZ.Application.Features.Planning.BudgetCall.Commands.UpdateBudgetCall;
using ERPEZ.Application.Features.Planning.BudgetCall.Dtos;
using ERPEZ.Application.Features.Planning.BudgetCall.Queries.GetBudgetCallById;
using ERPEZ.Application.Features.Planning.BudgetCall.Queries.GetBudgetCalls;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("budget-calls")]
[ApiController]
public class BudgetCallController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateBudgetCall([FromBody] CreateBudgetCallCommand command)
    {
        var budgetCall = await mediator.Send(command);

        return CreatedAtAction(nameof(GetBudgetCallById), new { id = budgetCall.Data }, budgetCall);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<BudgetCallResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBudgetCalls([FromQuery] GetBudgetCallsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<BudgetCallDetailedResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBudgetCallById(Guid id)
    {
        var budgetCall = await mediator.Send(new GetBudgetCallByIdQuery(id));

        return budgetCall.Succeeded ? Ok(budgetCall) : NotFound(budgetCall);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<BudgetCallResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<BudgetCallResponse>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<BudgetCallResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateBudgetCall(Guid id, [FromBody] UpdateBudgetCallRequest updateBudgetCall)
    {
        var request = new UpdateBudgetCallCommand
        {
            Id = id,
            UpdateBudgetCall = updateBudgetCall
        };

        var budgetCall = await mediator.Send(request);
        return budgetCall.Succeeded ? Ok(budgetCall) : BadRequest(budgetCall);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteBudgetCall(Guid id)
    {
        var command = new DeleteBudgetCallCommand(id);
        var budgetCall = await mediator.Send(command);

        return budgetCall.Succeeded ? Ok(budgetCall) : NotFound(budgetCall);
    }

    [HttpPatch("{id}/status")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ChangeBudgetCallStatus(Guid id, [FromBody] UpdateBudgetCallStatusRequest request)
    {
        var command = new ChangeBudgetCallStatusCommand(id, request.Status);
        
        var result = await mediator.Send(command);

        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}
