using ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Commands.CreateAgencyMasterBudget;
using ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Commands.DeleteAgencyMasterBudget;
using ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Commands.UpdateAgencyMasterBudget;
using ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Queries.GetAgencyMasterBudgetById;
using ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Queries.GetAgencyMasterBudgets;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("agency-master-budgets")]
[ApiController]
public class AgencyMasterBudgetController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateAgencyMasterBudget([FromBody] CreateAgencyMasterBudgetRequest request)
    {
        var result = await mediator.Send(new CreateAgencyMasterBudgetCommand(request));
        return result.Succeeded
            ? CreatedAtAction(nameof(GetAgencyMasterBudgetById), new { id = result.Data }, result)
            : BadRequest(result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedApiResponse<AgencyMasterBudgetResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAgencyMasterBudgets([FromQuery] GetAgencyMasterBudgetsQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<AgencyMasterBudgetResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAgencyMasterBudgetById(Guid id)
    {
        var result = await mediator.Send(new GetAgencyMasterBudgetByIdQuery(id));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<Unit>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAgencyMasterBudget(Guid id, [FromBody] UpdateAgencyMasterBudgetRequest request)
    {
        var command = new UpdateAgencyMasterBudgetCommand(id, request);
        var result = await mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAgencyMasterBudget(Guid id)
    {
        var result = await mediator.Send(new DeleteAgencyMasterBudgetCommand(id));
        return result.Succeeded ? NoContent() : NotFound();
    }
}
