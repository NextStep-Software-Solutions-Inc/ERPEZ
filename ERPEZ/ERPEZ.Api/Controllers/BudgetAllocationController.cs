using ERPEZ.Application.Features.Planning.Budgeting.BudgetAllocation.Commands.CreateBudgetAllocation;
using ERPEZ.Application.Features.Planning.Budgeting.BudgetAllocation.Commands.DeleteBudgetAllocation;
using ERPEZ.Application.Features.Planning.Budgeting.BudgetAllocation.Commands.UpdateBudgetAllocation;
using ERPEZ.Application.Features.Planning.Budgeting.BudgetAllocation.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.BudgetAllocation.Queries.GetBudgetAllocationById;
using ERPEZ.Application.Features.Planning.Budgeting.BudgetAllocation.Queries.GetBudgetAllocations;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("budget-allocations")]
[ApiController]
public class BudgetAllocationController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateBudgetAllocation([FromBody] CreateBudgetAllocationRequest request)
    {
        var result = await mediator.Send(new CreateBudgetAllocationCommand(request));
        return result.Succeeded
            ? CreatedAtAction(nameof(GetBudgetAllocationById), new { id = result.Data }, result)
            : BadRequest(result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<BudgetAllocationResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBudgetAllocations([FromQuery] GetBudgetAllocationsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<BudgetAllocationResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBudgetAllocationById(Guid id)
    {
        var result = await mediator.Send(new GetBudgetAllocationByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateBudgetAllocation(Guid id, [FromBody] UpdateBudgetAllocationRequest request)
    {
        var result = await mediator.Send(new UpdateBudgetAllocationCommand(id, request));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteBudgetAllocation(Guid id)
    {
        var result = await mediator.Send(new DeleteBudgetAllocationCommand(id));
        return result.Succeeded ? NoContent() : NotFound();
    }
}
