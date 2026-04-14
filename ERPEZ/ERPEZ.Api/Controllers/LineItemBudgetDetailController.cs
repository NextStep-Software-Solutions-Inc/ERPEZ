using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Commands.CreateLineItemBudgetDetail;
using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Commands.DeleteLineItemBudgetDetail;
using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Commands.UpdateLineItemBudgetDetail;
using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Queries.GetLineItemBudgetDetailById;
using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Queries.GetLineItemBudgetDetails;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("line-item-budget-details")]
[ApiController]
public class LineItemBudgetDetailController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateLineItemBudgetDetail([FromBody] CreateLineItemBudgetDetailRequest request)
    {
        var result = await mediator.Send(new CreateLineItemBudgetDetailCommand(request));
        return result.Succeeded
            ? CreatedAtAction(nameof(GetLineItemBudgetDetailById), new { id = result.Data }, result)
            : BadRequest(result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<LineItemBudgetDetailResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLineItemBudgetDetails()
    {
        var result = await mediator.Send(new GetLineItemBudgetDetailsQuery());
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<LineItemBudgetDetailResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLineItemBudgetDetailById(Guid id)
    {
        var result = await mediator.Send(new GetLineItemBudgetDetailByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateLineItemBudgetDetail(Guid id, [FromBody] UpdateLineItemBudgetDetailRequest request)
    {
        var command = new UpdateLineItemBudgetDetailCommand(request with { Id = id });
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteLineItemBudgetDetail(Guid id)
    {
        var result = await mediator.Send(new DeleteLineItemBudgetDetailCommand(id));
        return result.Succeeded ? NoContent() : NotFound();
    }
}
